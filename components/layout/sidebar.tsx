import Link from 'next/link';
import { LogoWithWordmark } from '@/components/brand/logo-mark';

const items: Array<[string, string, string]> = [
  ['Visao geral', '/dashboard', '⌘'],
  ['Chat IA', '/dashboard/chat', '◈'],
  ['Projetos', '/dashboard/projects', '▣'],
  ['Documentos', '/dashboard/documents', '▤'],
  ['Memoria', '/dashboard/memory', '◎'],
  ['Agentes', '/dashboard/agents', '✦'],
  ['Configuracoes', '/dashboard/settings', '⚙'],
  ['Admin', '/dashboard/admin', '◆']
];

type SidebarProps = {
  displayName?: string | null;
  role?: string | null;
};

export function Sidebar({ displayName, role }: SidebarProps) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/50 p-5 lg:block">
      <Link href="/" className="mb-8 block">
        <LogoWithWordmark subtitle="Professional AI OS" />
      </Link>
      <nav className="space-y-2">
        {items.map(([label, href, icon]) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
            <span className="w-5 text-center text-slate-500">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-3xl border border-indigo-400/20 bg-indigo-400/10 p-4">
        <p className="text-sm font-semibold text-indigo-100">Sessao ativa</p>
        <p className="mt-2 truncate text-xs leading-5 text-slate-400">{displayName ?? 'Usuario autenticado'}</p>
        <p className="mt-1 text-xs text-cyan-200">Perfil: {role ?? 'user'}</p>
        <form action="/auth/sign-out" method="post" className="mt-4">
          <button className="w-full rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10" type="submit">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
