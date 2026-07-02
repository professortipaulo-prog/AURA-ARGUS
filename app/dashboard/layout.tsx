import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <div className="hud-grid" />
      <Sidebar />
      <main className="relative z-10 min-w-0 flex-1">{children}</main>
    </div>
  );
}
