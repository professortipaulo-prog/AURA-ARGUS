const pillars = [
  ['Inteligência Contextual', 'Perfil, identidade e preferências aplicadas ao atendimento.'],
  ['Análise Avançada', 'ARGUS observa, valida riscos, rotas e execução técnica.'],
  ['Execução Assistida', 'AURA organiza, orienta e transforma demandas em entregáveis.'],
  ['Integração Total', 'Preparado para documentos, memória, agentes e ferramentas externas.'],
];

const modules = [
  ['AI Router', 'Claude + Gemini com seleção dinâmica'],
  ['Profile Engine', 'Contexto pessoal e profissional aplicado'],
  ['Identity Engine', 'Persona operacional para AURA e ARGUS'],
  ['Memory Engine', 'Próxima etapa da inteligência permanente'],
];

export default function HomePage() {
  return (
    <main className="psf-home-shell">
      <div className="psf-matrix" aria-hidden="true" />
      <div className="psf-glow psf-glow-a" aria-hidden="true" />
      <div className="psf-glow psf-glow-b" aria-hidden="true" />

      <header className="psf-topbar">
        <a className="psf-brand" href="#topo" aria-label="AURA ARGUS início">
          <span className="psf-brand-mark">◈</span>
          <span>
            <strong>AURA / ARGUS</strong>
            <small>Assistentes Inteligentes</small>
          </span>
        </a>
        <nav className="psf-nav" aria-label="Navegação principal">
          <a href="#assistentes">Assistentes</a>
          <a href="#modulos">Módulos</a>
          <a href="#recursos">Recursos</a>
        </nav>
        <div className="psf-actions">
          <a className="psf-btn psf-btn-ghost" href="/login">Entrar</a>
          <a className="psf-btn psf-btn-primary" href="/register">Criar perfil</a>
        </div>
      </header>

      <section className="psf-hero" id="topo">
        <div className="psf-copy">
          <p className="psf-eyebrow"><span /> Núcleo de Inteligência Operacional</p>
          <h1>
            Inteligência que vê,<br />
            compreende e <em>impulsiona resultados.</em>
          </h1>
          <p className="psf-lead">
            AURA e ARGUS são assistentes de IA projetados para atuar como um núcleo estratégico de inteligência operacional, com presença humana, análise profunda e execução precisa.
          </p>
          <div className="psf-cta-row">
            <a className="psf-btn psf-btn-primary psf-btn-large" href="/login">Acessar sistema</a>
            <a className="psf-btn psf-btn-outline psf-btn-large" href="/register">Criar perfil inicial</a>
          </div>
          <div className="psf-pill-row" aria-label="Status do sistema">
            <span>● Online</span>
            <span>Supabase ativo</span>
            <span>Claude + Gemini</span>
          </div>
        </div>

        <div className="psf-stage" id="assistentes">
          <article className="psf-avatar-card psf-aura-card">
            <div className="psf-avatar-ring">
              <img src="/avatars/aura.webp" alt="Avatar da AURA" />
            </div>
            <h2>AURA</h2>
            <p>Assistente Estratégica</p>
            <small>Compreende, organiza, orienta e transforma contexto em clareza.</small>
          </article>
          <article className="psf-avatar-card psf-argus-card">
            <div className="psf-avatar-ring">
              <img src="/avatars/argus.webp" alt="Avatar do ARGUS" />
            </div>
            <h2>ARGUS</h2>
            <p>Assistente Operacional</p>
            <small>Analisa, supervisiona, valida riscos e transforma intenção em execução.</small>
          </article>
        </div>

        <aside className="psf-anagram" aria-label="Anagrama AURA ARGUS">
          <span>Anagrama</span>
          <h2>AURA / ARGUS</h2>
          <div className="psf-letter-row"><b>A</b><b>U</b><b>R</b><b>A</b></div>
          <div className="psf-swap">⇄</div>
          <div className="psf-letter-row"><b>A</b><b>R</b><b>G</b><b>U</b><b>S</b></div>
          <p><strong>AURA</strong> compreende e organiza. <strong>ARGUS</strong> analisa e executa. Juntos, formam uma presença de IA completa.</p>
        </aside>
      </section>

      <section className="psf-info-grid" id="recursos">
        {pillars.map(([title, description]) => (
          <article className="psf-feature-card" key={title}>
            <span>✦</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="psf-section-grid" id="modulos">
        <article className="psf-panel psf-panel-wide">
          <p className="psf-section-tag">Personalidades complementares</p>
          <div className="psf-duo-grid">
            <div>
              <h3>AURA</h3>
              <p>Presença estratégica, consultiva e organizadora. Traduz contexto em clareza, planejamento e comunicação.</p>
              <small>Empática · Intuitiva · Organizadora · Conectadora</small>
            </div>
            <div>
              <h3>ARGUS</h3>
              <p>Presença operacional, analítica e vigilante. Monitora, valida, prioriza e transforma intenção em execução.</p>
              <small>Observador · Analítico · Executor · Estratégico</small>
            </div>
          </div>
        </article>

        <article className="psf-panel">
          <p className="psf-section-tag">Módulos ativos</p>
          <div className="psf-module-list">
            {modules.map(([title, description]) => (
              <div key={title}>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="psf-footer">
        <strong>AURA / ARGUS</strong>
        <span>AI Operating System · PSF Editora e Consultoria</span>
      </footer>
    </main>
  );
}
