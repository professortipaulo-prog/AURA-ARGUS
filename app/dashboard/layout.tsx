import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getSession } from '@/lib/auth/session';
import { LivingBackground } from '@/components/living-background';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BETA_DAYS = 7;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Contas do beta (PATCH_126, generalizado no PATCH_131 para cobrir
  // Estudantil e Worker) tem acesso por 7 dias contados a partir do
  // primeiro login real -- checagem feita aqui, no layout, para valer
  // em toda pagina do dashboard sem precisar duplicar em cada uma.
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .schema('core')
    .from('profiles')
    .select('beta_cohort, first_access_at, account_type')
    .eq('id', session.userId)
    .maybeSingle();

  if (profile?.beta_cohort && profile.first_access_at) {
    const elapsedMs = Date.now() - new Date(profile.first_access_at).getTime();
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    if (elapsedDays > BETA_DAYS) redirect('/beta/expired');
  }

  const accountType = (profile?.account_type as 'estudantil' | 'worker' | 'plus' | null) ?? null;

  return (
    <div className="aios-shell">
      <LivingBackground persona="argus" />
      <Sidebar displayName={session.displayName ?? session.email} email={session.email} role={session.role} accountType={accountType} />
      <main className="aios-main">{children}</main>
    </div>
  );
}
