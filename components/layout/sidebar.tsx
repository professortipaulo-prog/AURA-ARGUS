import Link from 'next/link';
import { LogoWithWordmark } from '@/components/brand/logo-mark';

const items: Array<[string, string, string]> = [
  ['Central de Operações', '/dashboard', '⌂'],
  ['Chat IA', '/dashboard/chat', '▱'],
  ['Perfil', '/dashboard/profile', '◎'],
  ['Identidade', '/dashboard/identity', '▦'],
  ['Projetos', '/dashboard/projects', '▣'],
  ['Documentos', '/dashboard/documents', '▤'],
  ['Ações', '/dashboard/actions', '⚡'],
  ['Memória', '/dashboard/memory', '◌'],
  ['Agentes', '/dashboard/agents', '✦'],
  ['Configurações', '/dashboard/settings', '⚙']
];

const adminOnlyItem: [string, string, string] = ['Admin', '/dashboard/admin', '◆'];

type SidebarProps = {
  displayName?: string | null;
  role?: string | null;
};

export function Sidebar({ displayName, role }: SidebarProps) {
  const isPrivileged = role === 'owner' || role === 'admin';
  const visibleItems = isPrivileged ? [...items, adminOnlyItem] : items;

  return (
    <aside className="aios-sidebar">
      <Link href="/dashboard" className="aios-sidebar-brand">
        <LogoWithWordmark subtitle="AI Operating System" />
      </Link>
      <nav className="aios-nav">
        {visibleItems.map(([label, href, icon]) => (
          <Link key={href} href={href} className="aios-nav-link">
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div className="aios-session-card">
        <div className="aios-user-avatar">P</div>
        <div>
          <strong>Paulo S. Filho</strong>
          <p>{displayName ?? 'professortipaulo@gmail.com'}</p>
          <em>Perfil: {role ?? 'owner'}</em>
        </div>
        <form action="/auth/sign-out" method="post">
          <button type="submit">Sair do sistema</button>
        </form>
      </div>
    </aside>
  );
}
