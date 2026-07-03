/**
 * app/page.tsx
 * Landing page — redesenhada a partir do material de referência
 * enviado pelo Product Owner (aura-argus-landing.html): fundo "cosmos"
 * com orbs, hero com ícone de olho, cards de AURA/ARGUS, features,
 * arquitetura e roadmap.
 *
 * Ajuste importante pedido pelo Product Owner: a landing NÃO tem mais
 * nenhum atalho direto para o dashboard ("Abrir painel" foi removido).
 * Todo caminho passa por /login ou /register — usar o produto exige
 * login, mesmo que a autenticação real ainda não esteja conectada
 * (ver README > Pendências Técnicas).
 *
 * Os status dos módulos/fases abaixo foram ajustados para refletir o
 * que REALMENTE existe no projeto hoje (não o que o material de
 * referência sugeria) — nada de badge "conectado"/"ativo" em algo que
 * ainda não funciona de verdade.
 */
import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo-mark';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_LINKS = [
  { href: '#assistentes', label: 'Assistentes' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#roadmap', label: 'Roadmap' }
];

type ModuleStatus = 'ready' | 'structured' | 'planned';

const MODULES: { name: string; status: ModuleStatus; label: string }[] = [
  { name: 'Chat com IA real', status: 'ready', label: 'conectado' },
  { name: 'AI Router', status: 'structured', label: 'estrutura pronta' },
  { name: 'Memory Manager', status: 'structured', label: 'estrutura pronta' },
  { name: 'Avatar animado', status: 'structured', label: 'placeholder ativo' },
  { name: 'Action Manager', status: 'planned', label: 'planejado' },
  { name: 'Voice Always-on', status: 'planned', label: 'planejado' },
  { name: 'FaceID', status: 'planned', label: 'planejado' },
  { name: 'Google Drive / OneDrive', status: 'planned', label: 'planejado' }
];

const MODULE_BADGE_CLASS: Record<ModuleStatus, string> = {
  ready: 'bg-brand-cyan/15 text-brand-cyan',
  structured: 'bg-brand-violet/15 text-brand-violet',
  planned: 'bg-white/8 text-slate-400'
};

const FEATURES = [
  { icon: '🧠', title: 'Chat com IA real', desc: 'AURA usa Anthropic Claude, ARGUS usa Gemini — conectados de verdade via backend seguro, chave nunca exposta no navegador.' },
  { icon: '🤖', title: 'Avatar animado', desc: 'Foto real de cada persona, com animação por estado (ouvindo, pensando, falando). Lip-sync fotorrealista é uma fase futura.' },
  { icon: '🎙️', title: 'Voz e escuta ativa', desc: 'Planejado: ativar AURA ou ARGUS pela voz, com Web Speech API.' },
  { icon: '👤', title: 'Login com reconhecimento facial', desc: 'Planejado: autenticação em duas etapas — usuário/senha + validação biométrica por câmera.' },
  { icon: '📎', title: 'Upload e edição de arquivos', desc: 'Planejado: suporte a DOCX, PDF, XLSX, PPTX, CSV e mais, direto no chat.' },
  { icon: '🔗', title: 'Integrações nativas', desc: 'Planejado: Google Drive, Gmail, OneDrive, Outlook, Teams, GitHub, NotebookLM.' }
];

const ARCH_LAYERS = [
  { color: '#60a5fa', label: 'Frontend', name: 'Next.js + React + TypeScript + Tailwind', detail: 'Dashboard, chat, avatar animado e tema claro/escuro' },
  { color: '#34d399', label: 'Backend', name: 'Next.js API Routes (app/api/ai)', detail: 'Proxy seguro — chave de IA nunca chega ao navegador' },
  { color: '#a855f7', label: 'IA', name: 'Anthropic Claude · Google Gemini', detail: 'Um provedor por persona, com fallback estrutural preparado' },
  { color: '#22d3ee', label: 'Dados', name: 'Supabase PostgreSQL', detail: 'Auth, memória e arquivos — schema pronto, conexão real é próxima fase' }
];

type PhaseStatus = 'done' | 'active' | 'planned';

const PHASES: { name: string; status: PhaseStatus }[] = [
  { name: 'Arquitetura e documentação', status: 'done' },
  { name: 'Fundação técnica (Next.js, Supabase, UI)', status: 'done' },
  { name: 'Chat conectado à IA real', status: 'done' },
  { name: 'Avatar animado (placeholder)', status: 'done' },
  { name: 'Autenticação real', status: 'active' },
  { name: 'Voz real', status: 'planned' },
  { name: 'Lip-sync do avatar', status: 'planned' },
  { name: 'Reconhecimento facial', status: 'planned' },
  { name: 'Memória permanente (Supabase)', status: 'planned' },
  { name: 'Integrações externas', status: 'planned' }
];

const PHASE_CLASS: Record<PhaseStatus, { card: string; badge: string; label: string }> = {
  done: { card: 'border-brand-cyan/20 bg-brand-cyan/5', badge: 'bg-brand-cyan/15 text-brand-cyan', label: 'concluída' },
  active: { card: 'border-brand-violet/30 bg-brand-violet/5', badge: 'bg-brand-violet/15 text-brand-violet', label: 'em andamento' },
  planned: { card: 'border-white/10 bg-white/[.03]', badge: 'bg-white/8 text-slate-500', label: 'planejada' }
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#060610] text-white">
      {/* Fundo cosmos */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="landing-orb -left-24 -top-24 h-[500px] w-[500px] bg-brand-violet/15" />
        <div className="landing-orb -bottom-36 -right-36 h-[600px] w-[600px] bg-brand-cyan/10" style={{ animationDelay: '-9s' }} />
        <div className="landing-orb left-[40%] top-[40%] h-[300px] w-[300px] bg-indigo-500/8" style={{ animationDelay: '-4s' }} />
      </div>

      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-[#060610]/70 px-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={34} idSuffix="nav" />
          <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-sm font-bold text-transparent">AURA / ARGUS</span>
        </Link>
        <div className="flex-1" />
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-slate-400 transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
        <ThemeToggle />
        <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
          Entrar
        </Link>
        {/* "Abrir painel" removido a pedido do Product Owner — usar o produto exige login. */}
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-28 text-center">
        <div className="landing-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-violet">
          <span className="landing-pulse-dot h-1.5 w-1.5 rounded-full bg-brand-violet" />
          Núcleo de Inteligência Operacional
        </div>

        <div className="landing-fade-up mb-6" style={{ animationDelay: '0.1s' }}>
          <LogoMark size={80} idSuffix="hero" />
        </div>

        <h1 className="landing-fade-up mb-4 max-w-4xl text-balance text-5xl font-black leading-tight tracking-tight md:text-7xl" style={{ animationDelay: '0.15s' }}>
          <span className="bg-gradient-to-br from-purple-300 to-brand-violet bg-clip-text text-transparent">AURA</span> e{' '}
          <span className="bg-gradient-to-br from-brand-cyan to-sky-400 bg-clip-text text-transparent">ARGUS</span>
          <br />
          seu sistema operacional
          <br />
          de IA pessoal.
        </h1>

        <p className="landing-fade-up mb-10 max-w-xl text-base text-slate-400 md:text-lg" style={{ animationDelay: '0.2s' }}>
          <span className="text-white">Dois assistentes</span>, um núcleo — AURA para produtividade, escrita e projetos; ARGUS para tecnologia, dados e automação.
        </p>

        <div className="landing-fade-up flex flex-wrap justify-center gap-3.5" style={{ animationDelay: '0.3s' }}>
          <Link href="/register" className="rounded-xl bg-gradient-to-br from-brand-violet to-brand-cyan px-8 py-3.5 text-sm font-bold text-[#06040d] transition hover:brightness-110">
            Criar acesso
          </Link>
          <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
            Entrar
          </Link>
        </div>

        <div className="landing-fade-up mt-12 flex flex-wrap justify-center gap-2.5" style={{ animationDelay: '0.4s' }}>
          <StatusPill label="Infra" value="Supabase + Vercel" ok />
          <StatusPill label="Banco" value="Schema + RLS" ok />
          <StatusPill label="IA" value="Anthropic / Gemini" ok />
          <StatusPill label="Deploy" value="Live · GitHub" live />
        </div>

        <div className="landing-fade-up mt-14 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4" style={{ animationDelay: '0.45s' }}>
          {MODULES.map((mod, i) => (
            <div key={mod.name} className="rounded-xl border border-white/10 bg-white/[.04] p-3 text-left transition hover:-translate-y-0.5 hover:border-white/20">
              <div className="text-[11px] text-slate-500">{String(i + 1).padStart(2, '0')}</div>
              <div className="text-xs font-semibold text-white">{mod.name}</div>
              <span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${MODULE_BADGE_CLASS[mod.status]}`}>
                {mod.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ASSISTENTES */}
      <section id="assistentes" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <SectionHeading
          tag="Os dois assistentes"
          title={
            <>
              Inteligência que <span className="bg-gradient-to-br from-purple-300 to-brand-violet bg-clip-text text-transparent">compreende</span>,<br />
              analisa e <span className="bg-gradient-to-br from-brand-cyan to-sky-400 bg-clip-text text-transparent">transforma</span>.
            </>
          }
          sub="Cada assistente tem um papel distinto — mas trabalham como um núcleo único, compartilhando memória, contexto e ferramentas."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <AssistantCard
            icon="🌟"
            name="AURA"
            nameClass="bg-gradient-to-br from-purple-300 to-brand-violet bg-clip-text text-transparent"
            full="Assistente Universal de Raciocínio e Ação"
            fullClass="text-brand-violet"
            desc="Compreende, organiza e executa. Transforma informação em clareza, direção e resultados. Especialista em escrita, editoração, comunicação e gestão de projetos."
            tags={['Produtividade', 'Escrita', 'Comunicação', 'Projetos']}
            tagClass="bg-brand-violet/15 text-brand-violet"
            border="hover:border-brand-violet/35"
            bg="bg-gradient-to-br from-brand-violet/10 to-brand-violet/[.03]"
          />
          <AssistantCard
            icon="👁"
            name="ARGUS"
            nameClass="bg-gradient-to-br from-brand-cyan to-sky-400 bg-clip-text text-transparent"
            full="Agente de Raciocínio, Gestão, Unificação e Supervisão"
            fullClass="text-brand-cyan"
            desc="Observa, analisa e protege. Antecipa riscos, monitora operações e garante decisões seguras. Especialista em tecnologia, software, automação e integrações."
            tags={['Tecnologia', 'Automação', 'Segurança', 'Integrações']}
            tagClass="bg-brand-cyan/15 text-brand-cyan"
            border="hover:border-brand-cyan/35"
            bg="bg-gradient-to-br from-brand-cyan/8 to-brand-cyan/[.03]"
          />
        </div>
      </section>

      <Divider />

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <SectionHeading tag="Funcionalidades" title="Tudo que você precisa, em um núcleo só." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:border-white/20 hover:bg-white/[.06]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#12102b] text-lg">{f.icon}</div>
              <h3 className="mb-1.5 text-sm font-bold text-white">{f.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ARQUITETURA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <SectionHeading tag="Arquitetura" title="Construído para escalar." center />
        <div className="mx-auto flex max-w-2xl flex-col">
          {ARCH_LAYERS.map((layer, i) => (
            <div key={layer.label} className="relative py-2">
              <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[.04] px-5 py-3.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: layer.color }} />
                <span className="min-w-[70px] text-[11px] font-bold uppercase tracking-wider text-slate-500">{layer.label}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{layer.name}</div>
                  <div className="text-xs text-slate-500">{layer.detail}</div>
                </div>
              </div>
              {i < ARCH_LAYERS.length - 1 && (
                <div className="relative flex justify-center py-0.5 text-slate-600" aria-hidden>↓</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ROADMAP */}
      <section id="roadmap" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <SectionHeading tag="Roadmap" title="Fases rumo à v1.0" center />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PHASES.map((phase, i) => {
            const cls = PHASE_CLASS[phase.status];
            return (
              <div key={phase.name} className={`rounded-xl border p-4 transition hover:border-white/25 ${cls.card}`}>
                <div className="mb-1.5 text-[11px] font-bold text-slate-500">Fase {i + 1}</div>
                <div className="text-xs font-semibold leading-snug text-white">{phase.name}</div>
                <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${cls.badge}`}>{cls.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Divider />

      {/* CTA FINAL */}
      <section className="relative z-10 border-t border-white/10 bg-gradient-to-br from-brand-violet/8 to-brand-cyan/6 px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <LogoMark size={64} idSuffix="cta" />
        </div>
        <h2 className="mb-3.5 text-3xl font-black tracking-tight md:text-5xl">
          Juntos, somos mais
          <br />
          que assistentes.
        </h2>
        <p className="mx-auto mb-9 max-w-lg text-base text-slate-400">
          Inteligência que trabalha <em>com</em> você, <em>para</em> você e <em>por</em> você.
          <br />
          Somos <strong className="text-brand-violet">AURA</strong> / <strong className="text-brand-cyan">ARGUS</strong>.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
            Entrar
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-8">
        <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-sm font-bold text-transparent">AURA / ARGUS</span>
        <div className="flex gap-4 text-xs text-slate-500">
          <a href="#" className="transition hover:text-slate-300">Termos</a>
          <a href="#" className="transition hover:text-slate-300">Privacidade</a>
          <a href="#" className="transition hover:text-slate-300">Contato</a>
        </div>
        <span className="text-xs text-slate-500">2026 - Paulo da Silva Filho, todos os direitos reservados.</span>
      </footer>
    </main>
  );
}

function StatusPill({ label, value, ok, live }: { label: string; value: string; ok?: boolean; live?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-brand-cyan' : ok ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      <span className="text-slate-400">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}

function SectionHeading({
  tag,
  title,
  sub,
  center = true
}: {
  tag: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <span className="mb-4 inline-block rounded-md bg-white/[.07] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {tag}
      </span>
      <h2 className="mb-3.5 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{title}</h2>
      {sub && <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-slate-400">{sub}</p>}
    </div>
  );
}

function Divider() {
  return <div className="relative z-10 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
}

function AssistantCard({
  icon,
  name,
  nameClass,
  full,
  fullClass,
  desc,
  tags,
  tagClass,
  border,
  bg
}: {
  icon: string;
  name: string;
  nameClass: string;
  full: string;
  fullClass: string;
  desc: string;
  tags: string[];
  tagClass: string;
  border: string;
  bg: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 p-8 transition hover:-translate-y-1 ${border} ${bg}`}>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{icon}</div>
      <h3 className={`mb-1 text-2xl font-extrabold ${nameClass}`}>{name}</h3>
      <div className={`mb-4 text-[11px] font-semibold uppercase tracking-wider opacity-80 ${fullClass}`}>{full}</div>
      <p className="mb-5 text-sm leading-relaxed text-slate-400">{desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${tagClass}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
