import { AvatarOrb } from '@/components/ui/avatar-orb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricRow } from '@/components/ui/metric-row';
import { SectionTitle } from '@/components/ui/section-title';
import { StatCard } from '@/components/ui/stat-card';

const stack = ['Supabase', 'Vercel', 'GitHub', 'Claude', 'Gemini', 'Drive', 'OneDrive', 'Gmail', 'NotebookLM'];
const pillars = [
  ['A.U.R.A.', 'Assistente Universal de Raciocínio e Ação', 'Presença contextual, empática e operacional. Escuta, compreende, organiza e age.'],
  ['A.R.G.U.S.', 'Agente de Raciocínio, Gestão, Unificação e Supervisão', 'Visão estratégica, monitoramento, segurança, análise e proteção do sistema.']
];
const modules = [
  ['AI Router', 'Seleção entre Claude, Gemini e futuros provedores.'],
  ['Memory Manager', 'Memória temporária, de projeto, vetorial e permanente.'],
  ['Action Manager', 'Execução de ações: documentos, e-mail, Drive, OneDrive e automações.'],
  ['Voice Always-on', 'Microfone em escuta ativa, hotword e conversação natural.'],
  ['Document Engine', 'Geração e conversão de PDF, Word, Excel, PowerPoint e imagens.'],
  ['Argus Watch', 'Supervisão de logs, custos, integrações, erros e riscos operacionais.']
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="hud-grid" />
      <div className="scanline" />

      <nav className="relative z-10 mx-auto mt-6 flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/55 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:px-7">
        <div className="flex items-center gap-3">
          <div className="brand-mark">A</div>
          <div>
            <p className="font-black tracking-[.16em] text-white">AURA / ARGUS</p>
            <p className="text-xs text-slate-500">Professional AI Operating System</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#mitologia" className="text-sm font-semibold text-slate-400 transition hover:text-white">Mitologia</a>
          <a href="#modulos" className="text-sm font-semibold text-slate-400 transition hover:text-white">Módulos</a>
          <Button href="/login" variant="ghost">Entrar</Button>
          <Button href="/dashboard">Abrir painel</Button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_.95fr] lg:px-8 lg:py-24">
        <div>
          <Badge>AURA compreende e age. ARGUS observa e protege.</Badge>
          <h1 className="mt-7 max-w-5xl text-balance text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
            Um assistente vivo para sua rotina profissional.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-slate-400">
            AURA/ARGUS será um núcleo inteligente com voz, memória, documentos, agentes, ações e supervisão contínua. A interface agora assume a identidade visual do produto: escura, cinematográfica, responsiva e preparada para IA real.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/dashboard" className="px-7">Entrar no cockpit</Button>
            <Button href="/register" variant="secondary" className="px-7">Criar perfil</Button>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <StatCard label="Infra" value="Live" detail="GitHub + Vercel" />
            <StatCard label="Banco" value="RLS" detail="Supabase pronto" />
            <StatCard label="UI" value="HUD" detail="Interface gráfica" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <Card className="relative overflow-hidden p-5 lg:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.3em] text-slate-500">Dual Core</p>
                <h2 className="mt-2 text-2xl font-black text-white">AURA / ARGUS</h2>
              </div>
              <span className="pulse-dot">online</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AvatarOrb name="AURA" role="Raciocínio e Ação" variant="aura" />
              <AvatarOrb name="ARGUS" role="Supervisão e Defesa" variant="argus" />
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[.04] p-5">
              <MetricRow label="Estado do sistema" value="Interface gráfica ativa" />
              <MetricRow label="Modo de operação" value="Assistente profissional" />
              <MetricRow label="Próxima camada" value="Autenticação + IA real" />
            </div>
          </Card>
        </div>
      </section>

      <section id="mitologia" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionTitle
          eyebrow="Identidade"
          title="A tecnologia nasce de uma narrativa forte."
          description="Os nomes AURA e ARGUS não são apenas marcas. Eles carregam função, personalidade e papéis complementares dentro do sistema."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {pillars.map(([title, acronym, description]) => (
            <Card key={title} className="min-h-64">
              <p className="text-sm uppercase tracking-[.3em] text-cyan-200/80">{title}</p>
              <h3 className="mt-4 text-3xl font-black text-white">{acronym}</h3>
              <p className="mt-5 text-base leading-8 text-slate-400">{description}</p>
            </Card>
          ))}
        </div>
        <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/[.035] p-6 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-xl font-bold text-white">Enquanto AURA olha para você, ARGUS olha pelo sistema.</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">AURA remete à brisa e à presença sutil. ARGUS remete a Argos Panoptes, o guardião de cem olhos. Um conduz a interação; o outro supervisiona a operação.</p>
        </div>
      </section>

      <section id="modulos" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionTitle
          eyebrow="Arquitetura visual"
          title="Um cockpit para conversar, decidir e executar."
          description="A interface foi estruturada para receber módulos reais sem refazer o design: chat, projetos, documentos, memória, agentes, configurações e administração."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description], index) => (
            <div key={title} className="module-card">
              <div className="flex items-start justify-between gap-4">
                <span className="module-index">0{index + 1}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500">preparado</span>
              </div>
              <h3 className="mt-6 text-xl font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8">
        <Card className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[.3em] text-cyan-200/80">Integrações previstas</p>
              <h2 className="mt-4 text-3xl font-black text-white">Pronto para conectar o mundo profissional.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-400">A base visual já considera integrações com provedores de IA, documentos, nuvem, comunicação e automações. As próximas etapas ligam a interface ao backend real.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stack.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-center text-sm font-semibold text-slate-300">{item}</div>)}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
