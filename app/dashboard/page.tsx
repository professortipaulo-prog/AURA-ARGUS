import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { DashboardAvatarSwitcher } from '@/components/dashboard-avatar-switcher';
import { getSession } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const metrics = [
  ['Status', 'Live', 'Sistema online'],
  ['Banco', 'RLS', 'Supabase seguro'],
  ['IA', 'Auto', 'Modelos dinâmicos'],
  ['Perfil', 'Ativo', 'Contexto aplicado']
];

const timeline = ['Supabase configurado', 'Buckets e policies criados', 'Deploy Vercel publicado', 'Profile Engine ativo', 'Identity Engine iniciado'];

export default async function DashboardPage() {
  const session = await getSession();
  if (session) {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.schema('core').from('profiles').select('account_type').eq('id', session.userId).maybeSingle();
    // Contas Estudantil e Worker nao veem a Central de Operacoes -- essa
    // tela e voltada a uso administrativo geral da plataforma. Cada tipo
    // de conta vai direto para a sua propria home.
    if (profile?.account_type === 'estudantil') redirect('/dashboard/estudos');
    if (profile?.account_type === 'worker') redirect('/dashboard/actions');
  }

  return (
    <>
      <Header title="Central de Operações" subtitle="Núcleo operacional do AURA/ARGUS." />
      <section className="aios-dashboard-grid">
        <div className="aios-content-column">
          <div className="aios-metrics-grid">
            {metrics.map(([label, value, detail]) => (
              <article className="aios-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{detail}</p>
              </article>
            ))}
          </div>

          <div className="aios-panel-grid">
            <article className="aios-panel featured">
              <span className="aios-panel-icon">⬡</span>
              <h2>Central AURA/ARGUS</h2>
              <p>Interface operacional para chat, memória, projetos, documentos, agentes e administração.</p>
              <div className="aios-action-grid">
                <Link href="/dashboard/chat">Conversar com IA</Link>
                <Link href="/dashboard/projects">Criar projeto</Link>
                <Link href="/dashboard/documents">Enviar documento</Link>
                <Link href="/dashboard/agents">Configurar agente</Link>
              </div>
            </article>

            <article className="aios-panel timeline">
              <span className="aios-panel-icon">◷</span>
              <h2>Linha do tempo</h2>
              <div>
                {timeline.map((item) => (
                  <p key={item}><i />{item}</p>
                ))}
              </div>
            </article>
          </div>

          <article className="aios-panel projects">
            <div className="aios-panel-title-row">
              <h2>Projetos recentes</h2>
              <Link href="/dashboard/projects">Ver todos</Link>
            </div>
            <div className="aios-project-grid">
              {['AcadêmicoFácil', 'Hub Agentes IA', 'PSF Editora'].map((project) => (
                <div key={project}>
                  <span>▣</span>
                  <strong>{project}</strong>
                  <p>Atualizado recentemente</p>
                </div>
              ))}
              <Link href="/dashboard/projects" className="new-project">+ Novo projeto</Link>
            </div>
          </article>
        </div>

        <aside className="aios-right-column">
          <DashboardAvatarSwitcher />
          <article className="aios-panel context-panel">
            <h2>Contexto ativo</h2>
            <p><span>Projeto atual</span>AURA/ARGUS</p>
            <p><span>Memória</span>Perfil inteligente aplicado</p>
            <p><span>Modelo ativo</span>Seleção automática</p>
            <p><span>Ferramentas</span>Preparadas para integração</p>
            <Link href="/dashboard/profile">Ver perfil completo →</Link>
          </article>
        </aside>
      </section>
    </>
  );
}
