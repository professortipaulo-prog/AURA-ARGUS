import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL, DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_SLUG } from '@/lib/auth/constants';

type ProfileBody = {
  fullName?: string;
  displayName?: string;
  professionalTitle?: string;
  company?: string;
  discProfile?: string;
  preferences?: string;
};

type SetupWarning = {
  step: string;
  message: string;
};

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function isSchemaExposureError(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('invalid schema') || normalized.includes('schema must be one of');
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id || !user.email) {
    return NextResponse.json({ ok: false, error: 'Usuário não autenticado.' }, { status: 401 });
  }

  let body: ProfileBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const admin = createSupabaseAdminClient();
  const core = admin.schema('core');
  const warnings: SetupWarning[] = [];

  const email = user.email.toLowerCase();
  const isFounder = email === ADMIN_EMAIL;
  const role = isFounder ? 'owner' : 'viewer';
  const fullName = cleanString(body.fullName) ?? (isFounder ? 'Paulo S. Filho' : user.email);
  const displayName = cleanString(body.displayName) ?? (isFounder ? 'Paulo Filho' : fullName);

  const { error: orgError } = await core
    .from('organizations')
    .upsert(
      {
        id: DEFAULT_ORGANIZATION_ID,
        name: 'AURA/ARGUS',
        slug: DEFAULT_ORGANIZATION_SLUG,
        settings: { owner_email: ADMIN_EMAIL },
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

  if (orgError) {
    if (isSchemaExposureError(orgError.message)) {
      warnings.push({
        step: 'organization',
        message: 'Schema core ainda não está exposto na API do Supabase. Login liberado; perfil será sincronizado após expor o schema core.'
      });
      return NextResponse.json({ ok: true, role, organizationId: null, warnings });
    }

    return NextResponse.json({ ok: false, error: `Erro ao preparar organização: ${orgError.message}` }, { status: 500 });
  }

  const discValue = cleanString(body.discProfile);
  const preferencesText = cleanString(body.preferences);

  const { error: profileError } = await core
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        display_name: displayName,
        email,
        professional_title: cleanString(body.professionalTitle) ?? (isFounder ? 'Administrador AURA/ARGUS' : null),
        company: cleanString(body.company) ?? (isFounder ? 'AURA/ARGUS' : null),
        disc_profile: discValue ? { predominant: discValue } : {},
        preferences: {
          onboarding_notes: preferencesText,
          role_hint: role
        },
        status: 'active',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    return NextResponse.json({ ok: false, error: `Erro ao salvar perfil: ${profileError.message}` }, { status: 500 });
  }

  const { error: memberError } = await core
    .from('organization_members')
    .upsert(
      {
        organization_id: DEFAULT_ORGANIZATION_ID,
        user_id: user.id,
        role,
        is_default: true
      },
      { onConflict: 'organization_id,user_id' }
    );

  if (memberError) {
    return NextResponse.json({ ok: false, error: `Erro ao definir acesso: ${memberError.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role, organizationId: DEFAULT_ORGANIZATION_ID, warnings });
}
