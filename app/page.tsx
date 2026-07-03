import Link from 'next/link';
import { LivingBackground } from '@/components/living-background';
import { AvatarPanel } from '@/components/avatar-panel';

const modules = [
  ['AI Router', 'Claude + Gemini com seleção automática'],
  ['Profile Engine', 'Contexto pessoal e profissional aplicado'],
  ['Document Engine', 'PDF, Word, Excel e apresentações'],
  ['Action Manager', 'Ações e integrações em preparação']
];

export default function HomePage() {
  return (
    <main className="landing-os">
      <LivingBackground persona="argus" />
      <header className="landing-nav">
        <Link href="/" className="landing-brand">
          <span className="landing-mark">⬡</span>
          <div>
            <strong>AURA / ARGUS</strong>
            <small>Professional AI OS</small>
          </div>
        </Link>
        <nav aria-label="Navegação principal">
          <a href="#assistentes">Assistentes</a>
          <a href="#modulos">Módulos</a>
          <a href="#recursos">Recursos</a>
        </nav>
        <div className="landing-actions">
          <Link href="/login" className="landing-ghost">Entrar</Link>
          <Link href="/register" className="landing-primary">Criar perfil</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="landing-kicker">Núcleo de Inteligência Operacional</span>
          <h1><span>AURA</span> / <b>ARGUS</b><br />seu sistema operacional de IA.</h1>
          <p>Dois assistentes inteligentes para trabalho, documentos, memória, projetos e automações. AURA organiza e orienta. ARGUS analisa e executa.</p>
          <div className="landing-cta-row">
            <Link href="/login" className="landing-primary big">Acessar sistema</Link>
            <Link href="/register" className="landing-ghost big">Criar perfil</Link>
          </div>
          <div className="landing-status">
            <span><i /> Online</span>
            <span><i /> Supabase ativo</span>
            <span><i /> Claude + Gemini</span>
          </div>
        </div>

        <aside className="landing-avatar-duo" id="assistentes">
          <AvatarPanel persona="aura" state="idle" />
          <AvatarPanel persona="argus" state="idle" />
        </aside>
      </section>

      <section className="landing-modules" id="modulos">
        {modules.map(([title, text]) => (
          <article key={title}>
            <span>◆</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="landing-feature" id="recursos">
        <div>
          <span className="landing-kicker">AURA + ARGUS</span>
          <h2>Presença humana, visão estratégica e execução inteligente.</h2>
        </div>
        <p>Interface inspirada na linguagem visual da PSF: escuro premium, neon violeta e ciano, binários em movimento, avatares afrodescendentes e experiência de produto profissional.</p>
      </section>
    </main>
  );
}
