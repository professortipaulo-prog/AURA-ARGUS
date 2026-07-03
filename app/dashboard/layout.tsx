import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getSession } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar displayName={session.displayName ?? session.email} role={session.role} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
