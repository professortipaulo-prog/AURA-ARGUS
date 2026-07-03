import { ThemeToggle } from '@/components/theme-toggle';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="dashboard-kicker">AURA / ARGUS</p>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="dashboard-header-actions">
        <span className="online-pill"><i /> Online</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
