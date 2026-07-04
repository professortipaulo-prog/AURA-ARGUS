const capabilities = [
  ['Inteligência contextual', 'Perfil, identidade e preferências aplicadas desde o primeiro atendimento.'],
  ['Análise operacional', 'ARGUS observa, valida riscos, prioriza rotas e orienta execução técnica.'],
  ['Produção assistida', 'AURA organiza ideias, transforma demandas e apoia entregas profissionais.'],
  ['Integração total', 'Base preparada para documentos, memória, agentes, automações e ferramentas externas.'],
];

const modules = [
  ['AI Router', 'Claude + Gemini com seleção dinâmica'],
  ['Profile Engine', 'Contexto pessoal e profissional aplicado'],
  ['Identity Engine', 'Persona própria para AURA e ARGUS'],
  ['Memory Engine', 'Próxima camada de inteligência permanente'],
];

const rain = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index * 7) % 100}%`,
  delay: `${-(index % 9) * 0.9}s`,
  duration: `${8 + (index % 6)}s`,
  opacity: 0.08 + (index % 5) * 0.035,
}));

export default function HomePage() {
  return (
    <main className="psfhome-shell">
      <div className="psfhome-bg" aria-hidden="true">
        <div className="psfhome-grid" />
        <div className="psfhome-glow psfhome-glow-a" />
        <div className="psfhome-glow psfhome-glow-b" />
        <div className="psfhome-rain">
          {rain.map((item, index) => (
            <span
              key={index}
              style={{
                left: item.left,
                animationDelay: item.delay,
                animationDuration: item.duration,
                opacity: item.opacity,
              }}
            >
              010011010101001101001001101001011010010101101001010011010010101101001010010101
            </span>
          ))}
        </div>
      </div>

      <header className="psfhome-header">
        <a className="psfhome-brand" href="/" aria-label="AURA ARGUS">
          <span className="psfhome-mark">◈</span>
          <span>
            <strong>AURA / ARGUS</strong>
            <small>Assistentes Inteligentes</small>
          </span>
        </a>

        <nav className="psfhome-nav" aria-label="Navegação principal">
          <a href="#assistentes">Assistentes</a>
          <a href="#modulos">Módulos</a>
          <a href="#recursos">Recursos</a>
        </nav>

        <div className="psfhome-actions">
          <a className="psfhome-btn psfhome-btn-ghost" href="/login">Entrar</a>
          <a className="psfhome-btn psfhome-btn-primary" href="/register">Criar perfil</a>
        </div>
      </header>

      <section className="psfhome-hero" id="assistentes">
        <div className="psfhome-copy">
          <p className="psfhome-eyebrow"><i /> Núcleo de Inteligência Operacional</p>
          <h1>
            Inteligência que vê,<br /> compreende e <span>impulsiona resultados.</span>
          </h1>
          <p className="psfhome-lead">
            AURA e ARGUS são assistentes de IA projetados para atuar como um núcleo estratégico de inteligência operacional, com presença humana, análise profunda e execução precisa.
          </p>

          <div className="psfhome-cta-row">
            <a className="psfhome-btn psfhome-btn-primary psfhome-btn-large" href="/login">Acessar sistema</a>
            <a className="psfhome-btn psfhome-btn-glass psfhome-btn-large" href="/register">Criar perfil inicial</a>
          </div>

          <div className="psfhome-card-grid">
            {capabilities.map(([title, description]) => (
              <article className="psfhome-mini-card" key={title}>
                <b>✦</b>
                <strong>{title}</strong>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="psfhome-avatars" aria-label="Avatares AURA e ARGUS">
          <div className="psfhome-avatar psfhome-avatar-aura">
            <span className="psfhome-avatar-orbit" />
            <img src="/avatars/aura.webp" alt="Avatar da AURA" />
            <h2>AURA</h2>
            <p>Assistente Estratégica</p>
            <small>Compreende, organiza e orienta.</small>
          </div>
          <div className="psfhome-avatar psfhome-avatar-argus">
            <span className="psfhome-avatar-orbit" />
            <img src="/avatars/argus.webp" alt="Avatar do ARGUS" />
            <h2>ARGUS</h2>
            <p>Assistente Operacional</p>
            <small>Analisa, supervisiona e executa.</small>
          </div>
        </div>

        <aside className="psfhome-anagram">
          <span>Anagrama</span>
          <h2>AURA / ARGUS</h2>
          <div className="psfhome-letters" aria-hidden="true">
            <b>A</b><b>U</b><b>R</b><b>A</b>
          </div>
          <div className="psfhome-swap">⇄</div>
          <div className="psfhome-letters" aria-hidden="true">
            <b>A</b><b>R</b><b>G</b><b>U</b><b>S</b>
          </div>
          <p><strong>AURA</strong> compreende e organiza. <strong>ARGUS</strong> analisa e executa. Juntos, formam uma presença de IA completa.</p>
        </aside>
      </section>

      <section className="psfhome-section" id="modulos">
        <article className="psfhome-panel psfhome-panel-wide">
          <span>Personalidades complementares</span>
          <div className="psfhome-persona-grid">
            <div>
              <h3>AURA</h3>
              <p>Presença estratégica, consultiva e organizadora. Traduz contexto em clareza, planejamento, escrita e comunicação.</p>
              <small>Empática · Intuitiva · Organizadora · Conectadora</small>
            </div>
            <div>
              <h3>ARGUS</h3>
              <p>Presença operacional, analítica e vigilante. Monitora, valida, prioriza e transforma intenção em execução.</p>
              <small>Observador · Analítico · Executor · Estratégico</small>
            </div>
          </div>
        </article>

        <article className="psfhome-panel" id="recursos">
          <span>Módulos ativos</span>
          <div className="psfhome-module-list">
            {modules.map(([title, description]) => (
              <div key={title}>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="psfhome-footer">
        <strong>AURA / ARGUS</strong>
        <span>AI Operating System · PSF Editora e Consultoria</span>
      </footer>
    </main>
  );
}
