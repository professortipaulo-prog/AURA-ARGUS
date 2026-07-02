import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-slate-500">AURA / ARGUS</p>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button href="/dashboard/chat" variant="secondary">Abrir chat</Button>
          <Button href="/login">Entrar</Button>
        </div>
      </div>
    </header>
  );
}
