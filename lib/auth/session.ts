import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/auth/constants';

export type AuraRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer' | 'guest' | 'user';

export type AuraSession = {
  userId: string;
  email: string;
  role: AuraRole;
  organizationId: string | null;
  displayName: string | null;
} | null;

export function isAdmin(session: AuraSession): boolean {
  return session?.role === 'owner' || session?.role === 'admin';
}

function isSchemaExposureError(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('invalid schema') || normalized.includes('schema must be one of');
}

export async function getSession(): Promise<AuraSession> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id || !user.email) return null;

  const fallbackRole: AuraRole = user.email.toLowerCase() === ADMIN_EMAIL ? 'owner' : 'user';
  const fallbackSession: Exclude<AuraSession, null> = {
    userId: user.id,
    email: user.email,
    role: fallbackRole,
    organizationId: null,
    displayName: user.user_metadata?.full_name ?? user.email
  };

  try {
    const admin = createSupabaseAdminClient();
    const core = admin.schema('core');

    const { data: profile, error: profileError } = await core
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError && !isSchemaExposureError(profileError.message)) {
      console.warn('[AURA/ARGUS] Falha ao ler profile:', profileError.message);
    }

    const { data: member, error: memberError } = await core
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memberError && !isSchemaExposureError(memberError.message)) {
      console.warn('[AURA/ARGUS] Falha ao ler membership:', memberError.message);
    }

    return {
      userId: user.id,
      email: user.email,
      role: (member?.role as AuraRole | undefined) ?? fallbackRole,
      organizationId: member?.organization_id ?? null,
      displayName: profile?.display_name ?? profile?.full_name ?? fallbackSession.displayName
    };
  } catch (sessionError) {
    console.warn('[AURA/ARGUS] Sessão em modo fallback:', sessionError);
    return fallbackSession;
  }
}
