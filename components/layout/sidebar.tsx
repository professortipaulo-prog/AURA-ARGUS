import Link from 'next/link';
import { LogoWithWordmark } from '@/components/brand/logo-mark';
import { PreviewModeToggle } from '@/components/layout/preview-mode-toggle';

const fullItems: Array<[string, string, string]> = [
  ['Central de Operações', '/dashboard', '⌂'],
  ['Chat IA', '/dashboard/chat', '▱'],
  ['Perfil', '/dashboard/profile', '◎'],
  ['Identidade', '/dashboard/identity', '▦'],
  ['Projetos', '/dashboard/projects', '▣'],
  ['Documentos', '/dashboard/documents', '▤'],
  ['Ações', '/dashboard/actions', '⚡'],
  ['Central de Estudos', '/dashboard/estudos', '🎓'],
  ['Memória', '/dashboard/memory', '◌'],
  ['Agentes', '/dashboard/agents', '✦'],
  ['Configurações', '/dashboard/settings', '⚙']
];

// Contas de aluno (Estudantil) veem um menu enxuto, focado no que
// interessa a elas -- sem Central de Operacoes, Projetos, Acoes,
// Agentes (linguagem e ferramentas voltadas a uso profissional).
const studentItems: Array<[string, string, string]> = [
  ['Central de Estudos', '/dashboard/estudos', '🎓'],
  ['Chat IA', '/dashboard/chat', '▱'],
  ['Documentos', '/dashboard/documents', '▤'],
  ['Memória', '/dashboard/memory', '◌'],
  ['Configurações', '/dashboard/settings', '⚙']
];

// Contas Worker: foco em produtividade/rotina administrativa -- sem
// Central de Estudos (nao se aplica) nem itens de gestao da plataforma
// (Projetos, Agentes, Central de Operacoes, Admin).
const workerItems: Array<[string, string, string]> = [
  ['Chat IA', '/dashboard/chat', '▱'],
  ['Ações', '/dashboard/actions', '⚡'],
  ['Documentos', '/dashboard/documents', '▤'],
  ['Memória', '/dashboard/memory', '◌'],
  ['Configurações', '/dashboard/settings', '⚙']
];

const adminOnlyItem: [string, string, string] = ['Admin', '/dashboard/admin', '◆'];

type SidebarProps = {
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
  accountType?: 'estudantil' | 'worker' | 'plus' | null;
  canPreview?: boolean;
  previewType?: 'estudantil' | 'worker' | null;
};

const HOME_BY_TYPE: Record<string, string> = {
  estudantil: '/dashboard/estudos',
  worker: '/dashboard/actions'
};

export function Sidebar({ displayName, email, role, accountType, canPreview, previewType }: SidebarProps) {
  const isPrivileged = role === 'owner' || role === 'admin';
  const isRestrictedAccount = accountType === 'estudantil' || accountType === 'worker';

  const baseItems = accountType === 'estudantil' ? studentItems : accountType === 'worker' ? workerItems : fullItems;
  const visibleItems = isPrivileged && !isRestrictedAccount ? [...baseItems, adminOnlyItem] : baseItems;
  const homeHref = (accountType && HOME_BY_TYPE[accountType]) || '/dashboard';
  const name = displayName || email || 'Usuário';
  const initial = name.trim().charAt(0).toUpperCase() || 'U';
  const roleLabel = previewType
    ? `visualizando como ${previewType === 'estudantil' ? 'aluno' : 'worker'}`
    : accountType === 'estudantil'
      ? 'aluno (beta)'
      : accountType === 'worker'
        ? 'worker (beta)'
        : role ?? 'owner';
  const subtitle = accountType === 'estudantil' ? 'Estudantil' : accountType === 'worker' ? 'Worker' : 'AI Operating System';

  return (
    <aside className="aios-sidebar">
      <Link href={homeHref} className="aios-sidebar-brand">
        <LogoWithWordmark subtitle={subtitle} />
      </Link>
      <nav className="aios-nav">
        {visibleItems.map(([label, href, icon]) => (
          <Link key={href} href={href} className="aios-nav-link">
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      {canPreview && <PreviewModeToggle previewType={previewType ?? null} />}
      <div className="aios-session-card">
        <div className="aios-user-avatar">{initial}</div>
        <div>
          <strong>{name}</strong>
          <p>{email ?? ''}</p>
          <em>Perfil: {roleLabel}</em>
        </div>
        <form action="/auth/sign-out" method="post">
          <button type="submit">Sair do sistema</button>
        </form>
      </div>
    </aside>
  );
}
