const capabilities = [
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
    <main className="landing-aios">
      <div className="landing-matrix" aria-hidden="true" />
      <div className="landing-orb landing-orb-a" aria-hidden="true" />
      <div className="landing-orb landing-orb-b" aria-hidden="true" />

      <header className="landing-header">
        <a className="landing-brand" href="/">
          <span className="landing-logo">◈</span>
          <span>
            <strong>AURA / ARGUS</strong>
            <small>Assistentes Inteligentes</small>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Navegação principal">
          <a href="#assistentes">Assistentes</a>
          <a href="#modulos">Módulos</a>
          <a href="#recursos">Recursos</a>
        </nav>

        <div className="landing-actions">
          <a className="landing-ghost" href="/login">Entrar</a>
          <a className="landing-primary" href="/register">Criar perfil</a>
        </div>
      </header>

      <section className="landing-hero" id="assistentes">
        <div className="landing-copy">
          <p className="landing-eyebrow"><span /> Núcleo de Inteligência Operacional</p>
          <h1>
            Inteligência que vê, compreende<br />
            e <em>impulsiona resultados.</em>
          </h1>
          <p className="landing-description">
            AURA e ARGUS são assistentes de IA projetados para atuar como um núcleo estratégico de inteligência operacional, com presença humana, análise profunda e execução precisa.
          </p>

          <div className="landing-cta-row">
            <a className="landing-primary landing-large" href="/login">Acessar sistema</a>
            <a className="landing-secondary landing-large" href="/register">Criar perfil inicial</a>
          </div>

          <div className="landing-capabilities">
            {capabilities.map(([title, description]) => (
              <div className="landing-capability" key={title}>
                <span>✦</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-stage" aria-label="Avatares AURA e ARGUS">
          <img src="/avatars/aura-argus-hero.png" alt="AURA e ARGUS, assistentes digitais afrodescendentes" />
          <div className="landing-avatar-name aura">
            <strong>AURA</strong>
            <span>Assistente Estratégica</span>
            <small>Empatia, organização e clareza.</small>
          </div>
          <div className="landing-avatar-name argus">
            <strong>ARGUS</strong>
            <span>Assistente Operacional</span>
            <small>Análise, vigilância e execução.</small>
          </div>
        </div>

        <aside className="landing-anagram">
          <span>Anagrama</span>
          <h2>AURA / ARGUS</h2>
          <div className="landing-letters" aria-hidden="true">
            <b>A</b><b>U</b><b>R</b><b>A</b>
          </div>
          <div className="landing-swap">⇄</div>
          <div className="landing-letters" aria-hidden="true">
            <b>A</b><b>R</b><b>G</b><b>U</b><b>S</b>
          </div>
          <p>
            AURA compreende e organiza. ARGUS analisa e executa. Juntos, formam uma presença de IA completa.
          </p>
        </aside>
      </section>

      <section className="landing-panel-row" id="modulos">
        <article className="landing-panel wide">
          <span className="landing-section-tag">Personalidades complementares</span>
          <div className="landing-persona-grid">
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

        <article className="landing-panel" id="recursos">
          <span className="landing-section-tag">Módulos ativos</span>
          <div className="landing-module-list">
            {modules.map(([title, description]) => (
              <div key={title}>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="landing-footer">
        <strong>AURA / ARGUS</strong>
        <span>AI Operating System · PSF Editora e Consultoria</span>
      </footer>
    </main>
  );
}
