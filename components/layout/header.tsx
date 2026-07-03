import { ThemeToggle } from '@/components/theme-toggle';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="aios-header">
      <div>
        <p className="aios-kicker">AURA / ARGUS</p>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="aios-header-actions">
        <span className="aios-status"><i />Online</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
