import { ThemeToggle } from '@/components/theme-toggle';

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="living-header sticky top-0 z-20 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="living-eyebrow">AURA / ARGUS</p>
          <h1 className="living-title">{title}</h1>
          <p className="living-subtitle">{subtitle}</p>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
