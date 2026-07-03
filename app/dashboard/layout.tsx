import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getSession } from '@/lib/auth/session';
import { LivingBackground } from '@/components/living-background';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="dashboard-os min-h-screen lg:flex">
      <LivingBackground />
      <Sidebar displayName={session.displayName ?? session.email} role={session.role} />
      <main className="relative z-10 min-w-0 flex-1">{children}</main>
    </div>
  );
}
