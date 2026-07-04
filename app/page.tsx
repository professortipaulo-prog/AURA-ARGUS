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

const meanings = [
  {
    label: 'A.U.R.A.',
    title: 'Assistente Universal de Raciocínio e Ação',
    myth: 'Na tradição clássica, Aura representa a brisa, a presença sutil e a influência que envolve e conduz. No sistema, AURA é a inteligência que compreende o contexto antes de agir.',
    role: 'Compreende, organiza, planeja, comunica e transforma informação em clareza para decisões e entregas.'
  },
  {
    label: 'A.R.G.U.S.',
    title: 'Assistente de Raciocínio, Gestão, Unificação e Supervisão',
    myth: 'Inspirado em Argus Panoptes, o guardião de cem olhos da mitologia grega, símbolo de vigilância permanente, análise e proteção.',
    role: 'Observa, analisa, integra, supervisiona e transforma estratégia em execução técnica e operacional.'
  }
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

      <section className="psfhome-hero" id="aura-argus">
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

        <div className="psfhome-avatars" id="assistentes" aria-label="Avatares AURA e ARGUS">
          <div className="psfhome-avatar psfhome-avatar-aura">
            <span className="psfhome-avatar-orbit" />
            <img src="/avatars/aura.webp" alt="Avatar da AURA" />
            <h2>AURA</h2>
            <p>Assistente Universal de Raciocínio e Ação</p>
            <small>Compreende, organiza e orienta.</small>
          </div>
          <div className="psfhome-avatar psfhome-avatar-argus">
            <span className="psfhome-avatar-orbit" />
            <img src="/avatars/argus.webp" alt="Avatar do ARGUS" />
            <h2>ARGUS</h2>
            <p>Assistente de Raciocínio, Gestão, Unificação e Supervisão</p>
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
          <div className="psfhome-anagram-definitions">
            <p><strong>AURA:</strong> Assistente Universal de Raciocínio e Ação.</p>
            <p><strong>ARGUS:</strong> Assistente de Raciocínio, Gestão, Unificação e Supervisão.</p>
          </div>
          <p className="psfhome-anagram-myth"><strong>AURA</strong> simboliza presença, percepção e orientação. <strong>ARGUS</strong>, inspirado em Argus Panoptes, representa vigilância, análise e supervisão. Juntos, unem compreensão estratégica e execução operacional.</p>
        </aside>
      </section>

      <section className="psfhome-meaning-section" aria-label="Significado de AURA e ARGUS">
        <div className="psfhome-section-title">
          <span>Identidade dos assistentes</span>
          <h2>O significado de AURA e ARGUS</h2>
          <p>Os nomes combinam acrônimo funcional, referência simbólica e papéis complementares dentro do sistema.</p>
        </div>

        <div className="psfhome-meaning-grid">
          {meanings.map((item) => (
            <article className="psfhome-meaning-card" key={item.label}>
              <b>{item.label}</b>
              <h3>{item.title}</h3>
              <p>{item.myth}</p>
              <small>{item.role}</small>
            </article>
          ))}
        </div>

        <div className="psfhome-philosophy-card">
          <strong>AURA compreende. ARGUS executa.</strong>
          <p>Uma transforma informação em clareza. O outro converte decisões em ação. Juntos, formam um núcleo de inteligência operacional para pessoas, projetos e organizações.</p>
        </div>
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
