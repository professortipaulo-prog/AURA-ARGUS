import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_SLUG } from '@/lib/auth/constants';
import { ADMIN_EMAIL } from '@/lib/auth/constants';

export type BetaStatus = { remaining: number; total: number; open: boolean };

export async function getBetaStatus(): Promise<BetaStatus> {
  const admin = createSupabaseAdminClient();

  const { data: config } = await admin.schema('core').from('beta_config').select('max_signups, signup_open').eq('id', true).maybeSingle();
  const total = config?.max_signups ?? 15;
  const open = config?.signup_open ?? true;

  // O seu proprio e-mail (dono/admin) nunca conta como vaga do beta --
  // assim voce pode testar o formulario quantas vezes quiser sem tirar
  // acesso de nenhum dos 15 alunos reais.
  const { count } = await admin
    .schema('core')
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('beta_cohort', true)
    .neq('email', ADMIN_EMAIL);
  const used = count ?? 0;

  return { remaining: Math.max(0, total - used), total, open };
}

export async function signupBetaUser(params: {
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
    return { ok: false, error: 'Para aluno menor de 18 anos, é obrigatório informar nome e e-mail do responsável.' };
  }
  if (!params.isMinor && !params.email.trim()) {
    return { ok: false, error: 'E-mail é obrigatório.' };
  }

  const status = await getBetaStatus();
  if (!status.open || status.remaining <= 0) {
    return { ok: false, error: 'As vagas do beta já foram todas preenchidas.' };
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
      return { ok: false, error: createError?.message ?? 'Falha ao criar a conta. Verifique se o e-mail já não está em uso.' };
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
