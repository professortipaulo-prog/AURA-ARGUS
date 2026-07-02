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

export function Sidebar() {
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
        <p className="text-sm font-semibold text-indigo-100">Modo assistente</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">Microfone, memoria, documentos e acoes serao conectados nas proximas sprints.</p>
      </div>
    </aside>
  );
}
