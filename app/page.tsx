const modules = [
  ['01', 'AI Router', 'Claude + Gemini', 'online'],
  ['02', 'Memory Manager', 'Contexto e sessão', 'preparado'],
  ['03', 'Action Manager', 'Ações e automações', 'preparado'],
  ['04', 'Document Engine', 'PDF · Word · Excel', 'preparado'],
  ['05', 'Voice Always-on', 'Escuta ativa futura', 'em breve'],
  ['06', 'FaceID', 'Validação biométrica', 'em breve'],
];

const features = [
  ['Chat inteligente', 'AURA conversa, organiza ideias, gera documentos e conduz sua produtividade.'],
  ['Supervisão estratégica', 'ARGUS observa, analisa riscos, valida rotas, memória, APIs e integrações.'],
  ['Documentos profissionais', 'Geração e leitura de PDF, Word, Excel, PowerPoint, imagens, código e arquivos técnicos.'],
  ['Memória contextual', 'Perfil pessoal, profissional, projetos, preferências e histórico para respostas mais precisas.'],
  ['Integrações', 'Preparado para Gmail, Drive, OneDrive, Teams, GitHub, NotebookLM e automações futuras.'],
  ['Segurança operacional', 'Supabase, Vercel, rotas protegidas, logs e controle administrativo por usuário.'],
];

export default function HomePage() {
  return (
    <main className="psf-home">
      <div className="psf-matrix" aria-hidden="true" />
      <div className="psf-orb psf-orb-a" aria-hidden="true" />
      <div className="psf-orb psf-orb-b" aria-hidden="true" />

      <header className="psf-nav-shell">
        <a className="psf-brand" href="/">
          <span className="psf-logo-mark">⬡</span>
          <span>
            <strong>AURA / ARGUS</strong>
            <small>Assistentes Inteligentes</small>
          </span>
        </a>
        <nav className="psf-nav-links" aria-label="Navegação principal">
          <a href="#aura-argus">Assistentes</a>
          <a href="#modulos">Módulos</a>
          <a href="#recursos">Recursos</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
        <div className="psf-nav-actions">
          <a className="psf-link-button" href="/login">Entrar</a>
          <a className="psf-primary-button" href="/register">Criar perfil</a>
        </div>
      </header>

      <section className="psf-hero" id="topo">
        <div className="psf-hero-copy">
          <div className="psf-eyebrow"><span /> Núcleo de Inteligência Operacional</div>
          <h1>
            <span>AURA</span> e <span>ARGUS</span><br />
            seu sistema operacional de IA para trabalho e vida profissional.
          </h1>
          <p>
            Dois assistentes inteligentes conectados ao seu contexto: AURA compreende, organiza e executa; ARGUS observa, analisa e supervisiona.
          </p>
          <div className="psf-hero-actions">
            <a className="psf-primary-button large" href="/register">Criar perfil inicial</a>
            <a className="psf-secondary-button large" href="/login">Já tenho acesso</a>
          </div>
          <div className="psf-status-row">
            <span><i /> Vercel online</span>
            <span><i /> Supabase conectado</span>
            <span><i /> Claude + Gemini configurados</span>
          </div>
        </div>

        <div className="psf-avatar-stage" aria-label="Avatares AURA e ARGUS">
          <div className="psf-avatar-hud psf-hud-left">
            <strong>AURA</strong>
            <span>Assistente Universal de Raciocínio e Ação</span>
            <em>Estou aqui para ajudar você.</em>
          </div>
          <img src="/avatars/aura-argus-hero.png" alt="Avatares digitais AURA e ARGUS" />
          <div className="psf-avatar-hud psf-hud-right">
            <strong>ARGUS</strong>
            <span>Agente de Raciocínio, Gestão, Unificação e Supervisão</span>
            <em>Pronto para observar, analisar e executar.</em>
          </div>
          <div className="psf-wave" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
        </div>
      </section>

      <section className="psf-section" id="aura-argus">
        <div className="psf-section-head">
          <span className="psf-section-tag">AURA + ARGUS</span>
          <h2>Presença humana, visão estratégica e execução inteligente.</h2>
          <p>A interface nasce inspirada no visual tecnológico da PSF, mas com identidade própria: neon azul, profundidade escura, avatares centrais e movimento sutil.</p>
        </div>
        <div className="psf-assistant-grid">
          <article className="psf-agent-card aura">
            <span className="psf-agent-icon">✦</span>
            <h3>AURA</h3>
            <small>Assistente Universal de Raciocínio e Ação</small>
            <p>Foca em interação, escrita, documentos, organização, escuta ativa e produtividade pessoal/profissional.</p>
            <div><b>Compreende</b><b>Organiza</b><b>Executa</b></div>
          </article>
          <article className="psf-agent-card argus">
            <span className="psf-agent-icon">◉</span>
            <h3>ARGUS</h3>
            <small>Agente de Raciocínio, Gestão, Unificação e Supervisão</small>
            <p>Foca em análise, segurança, supervisão, integrações, ações, custos, rotas e monitoramento do sistema.</p>
            <div><b>Observa</b><b>Analisa</b><b>Protege</b></div>
          </article>
        </div>
      </section>

      <section className="psf-section" id="modulos">
        <div className="psf-section-head compact">
          <span className="psf-section-tag">Módulos</span>
          <h2>O núcleo operacional.</h2>
        </div>
        <div className="psf-modules-grid">
          {modules.map(([num, name, detail, status]) => (
            <article key={name} className="psf-module-card">
              <span>{num}</span>
              <h3>{name}</h3>
              <p>{detail}</p>
              <em>{status}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="psf-section" id="recursos">
        <div className="psf-section-head compact">
          <span className="psf-section-tag">Recursos</span>
          <h2>Projetado para ser mais que um chat.</h2>
        </div>
        <div className="psf-feature-grid">
          {features.map(([title, description]) => (
            <article key={title} className="psf-feature-card">
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="psf-section psf-roadmap" id="roadmap">
        <div className="psf-section-head compact">
          <span className="psf-section-tag">Roadmap</span>
          <h2>Próxima fase: autenticação real e dashboard protegido.</h2>
          <p>A interface agora fica alinhada à identidade PSF. O próximo passo técnico é conectar cadastro, login, perfil admin e proteger as rotas de IA.</p>
        </div>
        <div className="psf-roadmap-line">
          <span className="done">Infra</span>
          <span className="done">Interface</span>
          <span className="active">Auth</span>
          <span>Chat IA</span>
          <span>Memória</span>
          <span>Ações</span>
        </div>
      </section>
    </main>
  );
}
