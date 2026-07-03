import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ProfileWizard } from '@/components/profile/profile-wizard';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mergeProfile } from '@/lib/profile/context';
import type { ProfileData } from '@/lib/profile/types';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.rpc('get_user_profile_intelligence', { p_user_id: session.userId });
  const raw = Array.isArray(data) ? data[0] : data;

  return (
    <>
      <Header title="Perfil inteligente" subtitle="PROFILE ENGINE — contexto pessoal, profissional e comportamental." />
      <ProfileWizard email={session.email} initialProfile={mergeProfile(raw?.profile_data as Partial<ProfileData> | null)} initialCompletion={raw?.completion_percent ?? 0} />
    </>
  );
}
