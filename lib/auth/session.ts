import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

export async function getSession(): Promise<AuraSession> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id || !user.email) return null;

  const admin = createSupabaseAdminClient();

  const { data: profile } = await admin
    .schema('core')
    .from('profiles')
    .select('display_name, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const { data: member } = await admin
    .schema('core')
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email,
    role: (member?.role as AuraRole | undefined) ?? 'user',
    organizationId: member?.organization_id ?? null,
    displayName: profile?.display_name ?? profile?.full_name ?? user.email
  };
}
