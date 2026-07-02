import Link from 'next/link';

const items: Array<[string, string, string]> = [
  ['Visão geral', '/dashboard', '⌘'],
  ['Chat IA', '/dashboard/chat', '◈'],
  ['Projetos', '/dashboard/projects', '▣'],
  ['Documentos', '/dashboard/documents', '▤'],
  ['Memória', '/dashboard/memory', '◎'],
  ['Agentes', '/dashboard/agents', '✦'],
  ['Configurações', '/dashboard/settings', '⚙'],
  ['Admin', '/dashboard/admin', '◆']
];

export function Sidebar() {
  return (
    <aside className="relative z-20 hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/65 p-5 backdrop-blur-2xl lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <div className="brand-mark">A</div>
        <div>
          <p className="font-black tracking-[.16em] text-white">AURA / ARGUS</p>
          <p className="text-xs text-slate-500">Professional AI OS</p>
        </div>
      </Link>
      <nav className="space-y-2">
        {items.map(([label, href, icon]) => (
          <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
            <span className="w-5 text-center text-slate-500 transition group-hover:text-cyan-200">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <p className="text-sm font-bold text-cyan-100">Modo assistente</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">Microfone, memória, documentos e ações serão conectados nas próximas etapas.</p>
      </div>
      <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-white/[.035] p-4">
        <p className="text-xs uppercase tracking-[.25em] text-slate-500">Status</p>
        <p className="mt-2 text-sm font-semibold text-emerald-200">Infraestrutura online</p>
      </div>
    </aside>
  );
}
