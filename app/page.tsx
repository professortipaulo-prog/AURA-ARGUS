import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoWithWordmark } from '@/components/brand/logo-mark';

const modules = [
  { sigla: 'AURA', title: 'Assistente Universal de Raciocínio e Ação', text: 'Presença inteligente para conversa, escrita, documentos, projetos, voz e produtividade profissional.' },
  { sigla: 'ARGUS', title: 'Agente de Raciocínio, Gestão, Unificação e Supervisão', text: 'Camada estratégica para observar, proteger, organizar rotas, memória, integrações e automações.' },
  { sigla: 'CORE', title: 'Infraestrutura operacional', text: 'Autenticação, banco, storage, provedores de IA, sessão, permissões e deploy contínuo.' }
];

const capabilities = [
  'Chat e conversa com IA',
  'Memória de sessão e projeto',
  'Documentos, leitura e geração',
  'Projetos e fluxos de trabalho',
  'Integrações com Drive, Gmail e OneDrive',
  'Administração, logs e segurança'
];

const products = [
  { title: 'AURA', label: 'Interface humana', text: 'Compreende, conversa, organiza e conduz sua rotina profissional com linguagem natural.' },
  { title: 'ARGUS', label: 'Supervisão estratégica', text: 'Observa, monitora, antecipa riscos e coordena ações nos bastidores do sistema.' },
  { title: 'AI Router', label: 'Claude + Gemini', text: 'Roteamento inteligente entre provedores de IA conforme contexto, custo e complexidade.' },
  { title: 'Document Engine', label: 'Arquivos e relatórios', text: 'Base para gerar, ler, converter e organizar documentos em diversos formatos.' }
];

export default function HomePage() {
  return (
    <main className="psf-shell min-h-screen overflow-hidden">
      <div className="matrix-rain" aria-hidden>
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} style={{ left: `${(i * 3.7) % 100}%`, animationDelay: `${(i % 9) * -1.4}s`, animationDuration: `${12 + (i % 7) * 2}s` }}>
            AURA ARGUS 0101 IA CORE FLOW MEMORY ACTION
          </span>
        ))}
      </div>

      <header className="psf-header mx-auto mt-6 flex max-w-7xl items-center justify-between px-6 py-4">
        <LogoWithWordmark subtitle="Assistentes Inteligentes" />
        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-300 md:flex">
          <a href="#produtos" className="psf-nav-link">Produtos</a>
          <a href="#modulos" className="psf-nav-link">Módulos</a>
          <a href="#aura-argus" className="psf-nav-link">AURA/ARGUS</a>
          <a href="#core" className="psf-nav-link">CORE</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden text-sm font-bold text-slate-200 transition hover:text-white sm:inline-flex">Entrar</Link>
          <Link href="/dashboard" className="psf-button">Abrir painel</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10">
          <div className="psf-pill"><span /> PSF • AURA / ARGUS • Inteligência operacional</div>
          <h1 className="psf-hero-title mt-8 text-6xl font-black leading-[.95] tracking-[-.06em] text-white md:text-8xl">
            Inteligência,<br />
            <span>tecnologia</span><br />
            e presença<br />
            operacional.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-300">
            AURA e ARGUS são o núcleo de IA da PSF para transformar trabalho, documentos,
            automações, memória e decisões em um sistema operacional inteligente.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="psf-button psf-button-green">Criar acesso</Link>
            <Link href="/dashboard/chat" className="psf-button psf-button-outline">Testar chat</Link>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            <div className="psf-mini-stat"><b>Deploy</b><span>Vercel ativo</span></div>
            <div className="psf-mini-stat"><b>IA</b><span>Claude + Gemini</span></div>
            <div className="psf-mini-stat"><b>Banco</b><span>Supabase pronto</span></div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="psf-logo-stage">
            <div className="psf-scan" />
            <div className="psf-orbit psf-orbit-one" />
            <div className="psf-orbit psf-orbit-two" />
            <div className="psf-core-card">
              <div className="psf-live-dot" />
              <div className="psf-big-mark">A/A</div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[.34em] text-cyan-300">Sistema operacional de IA</p>
              <h2 className="mt-3 text-4xl font-black text-white">AURA / ARGUS</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                AURA compreende e age. ARGUS observa e protege. Juntos, formam um núcleo inteligente de raciocínio, ação, memória e supervisão.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="psf-section-head">
          <p>Produtos digitais</p>
          <h2>AURA / ARGUS no portfólio PSF.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <ProductCard />
          <div className="grid gap-6 sm:grid-cols-2">
            {products.map((item) => (
              <article key={item.title} className="psf-service-card">
                <span className="psf-card-kicker">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modulos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="psf-section-head">
          <p>Núcleo do sistema</p>
          <h2>Três camadas para um produto escalável.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {modules.map((item) => (
            <article key={item.sigla} className="psf-layer-card">
              <strong>{item.sigla}</strong>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="aura-argus" className="mx-auto max-w-7xl px-6 py-20">
        <div className="psf-panel-grid">
          <div>
            <div className="psf-section-head compact">
              <p>Operação assistida</p>
              <h2>O que o sistema precisa fazer por você.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              A experiência deve começar pelo uso real: conversar, organizar, consultar documentos, executar tarefas, aprender com o contexto e proteger decisões.
            </p>
          </div>
          <div className="psf-capability-list">
            {capabilities.map((capability) => (
              <div key={capability}><span>›</span>{capability}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-500">
        <div className="border-t border-cyan-400/10 pt-8">© 2026 AURA / ARGUS • PSF Editora, Consultoria e Tecnologia</div>
      </footer>
    </main>
  );
}
