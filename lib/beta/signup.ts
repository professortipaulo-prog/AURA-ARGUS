import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_SLUG } from '@/lib/auth/constants';
import { ADMIN_EMAIL } from '@/lib/auth/constants';

export type BetaProgram = 'estudantil' | 'worker';
export type BetaStatus = { remaining: number; total: number; open: boolean };

const TEST_EMAILS = [ADMIN_EMAIL, 'professortipaulo+teste@gmail.com', 'profpaulofilho@gmail.com'];

export async function getBetaStatus(program: BetaProgram): Promise<BetaStatus> {
  const admin = createSupabaseAdminClient();

  const { data: config } = await admin.schema('core').from('beta_config').select('max_signups, signup_open').eq('program', program).maybeSingle();
  const total = config?.max_signups ?? 15;
  const open = config?.signup_open ?? true;

  // O seu proprio e-mail (dono/admin) e os alias de teste dele nunca
  // contam como vaga do beta -- assim voce pode testar o formulario
  // quantas vezes quiser sem tirar acesso de nenhuma vaga real.
  const { count } = await admin
    .schema('core')
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('account_type', program)
    .not('email', 'in', `(${TEST_EMAILS.join(',')})`);
  const used = count ?? 0;

  return { remaining: Math.max(0, total - used), total, open };
}

export async function signupBetaUser(params: {
  program: BetaProgram;
  isMinor: boolean;
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  guardianName?: string;
  guardianEmail?: string;
}): Promise<{ ok: boolean; error: string | null }> {
  if (!params.fullName.trim() || !params.password || params.password.length < 8) {
    return { ok: false, error: 'Nome e senha (mínimo 8 caracteres) são obrigatórios.' };
  }
  if (params.isMinor && (!params.guardianName?.trim() || !params.guardianEmail?.trim())) {
    return { ok: false, error: 'Para participante menor de 18 anos, é obrigatório informar nome e e-mail do responsável.' };
  }
  if (!params.isMinor && !params.email.trim()) {
    return { ok: false, error: 'E-mail é obrigatório.' };
  }

  const status = await getBetaStatus(params.program);
  if (!status.open || status.remaining <= 0) {
    return { ok: false, error: 'As vagas deste beta já foram todas preenchidas.' };
  }

  const loginEmail = params.isMinor ? params.guardianEmail!.trim() : params.email.trim();
  const admin = createSupabaseAdminClient();

  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: loginEmail,
      password: params.password,
      email_confirm: true,
      user_metadata: { full_name: params.fullName }
    });

    if (createError || !created?.user?.id) {
      const alreadyRegistered = /already.*registered|already.*exists/i.test(createError?.message ?? '');
      return {
        ok: false,
        error: alreadyRegistered
          ? 'Este e-mail já tem uma conta. Se já é seu, é só entrar em vez de cadastrar de novo.'
          : (createError?.message ?? 'Falha ao criar a conta.')
      };
    }

    const userId = created.user.id;

    await admin
      .schema('core')
      .from('organizations')
      .upsert({ id: DEFAULT_ORGANIZATION_ID, name: 'AURA/ARGUS', slug: DEFAULT_ORGANIZATION_SLUG }, { onConflict: 'id' });

    const { error: profileError } = await admin
      .schema('core')
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: loginEmail,
          full_name: params.fullName.trim(),
          display_name: params.fullName.trim(),
          is_minor: params.isMinor,
          guardian_name: params.isMinor ? params.guardianName!.trim() : null,
          guardian_email: params.isMinor ? params.guardianEmail!.trim() : null,
          guardian_consent_at: params.isMinor ? new Date().toISOString() : null,
          beta_cohort: true,
          account_type: params.program,
          status: 'active'
        },
        { onConflict: 'id' }
      );

    if (profileError) return { ok: false, error: profileError.message };

    const { error: memberError } = await admin
      .schema('core')
      .from('organization_members')
      .upsert({ organization_id: DEFAULT_ORGANIZATION_ID, user_id: userId, role: 'operator', is_default: true }, { onConflict: 'organization_id,user_id' });

    if (memberError) return { ok: false, error: memberError.message };

    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido ao criar a conta.' };
  }
}
