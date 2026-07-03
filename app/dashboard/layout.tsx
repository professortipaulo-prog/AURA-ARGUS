import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getSession } from '@/lib/auth/session';
import { LivingBackground } from '@/components/living-background';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="aios-shell">
      <LivingBackground persona="argus" />
      <Sidebar displayName={session.displayName ?? session.email} role={session.role} />
      <main className="aios-main">{children}</main>
    </div>
  );
}
