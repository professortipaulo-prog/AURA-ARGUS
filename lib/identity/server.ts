import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildIdentityEngine } from './engine';

export async function getCurrentUserIdentity() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.id || !user.email) {
    return { user: null, identity: null, error: 'Não autenticado.' };
  }

  const { data, error } = await supabase.rpc('get_user_profile_intelligence', { p_user_id: user.id });

  if (error) {
    return {
      user,
      identity: buildIdentityEngine(user.email, null),
      error: error.message
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    user,
    identity: buildIdentityEngine(user.email, row?.profile_data ?? null),
    error: null
  };
}
