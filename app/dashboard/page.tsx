import { Header } from '@/components/layout/header';
import { AvatarOrb } from '@/components/ui/avatar-orb';
import { Card } from '@/components/ui/card';
import { MetricRow } from '@/components/ui/metric-row';
import { StatusPill } from '@/components/ui/status-pill';
import { StatCard } from '@/components/ui/stat-card';

const activities = [
  ['Supabase', 'Banco, buckets e policies configurados'],
  ['Vercel', 'Deploy em produção ativo'],
  ['GitHub', 'Repositório principal conectado'],
  ['Interface', 'Cockpit gráfico implementado']
];
const nextActions = ['Autenticação real', 'Conexão CRUD Supabase', 'AI Router Claude/Gemini', 'Memory Manager', 'Action Manager'];

export default function DashboardPage() {
  return (
    <>
      <Header title="Cockpit AURA/ARGUS" subtitle="Visão operacional do núcleo inteligente." />
      <section className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Deploy" value="Live" detail="Vercel produção" />
          <StatCard label="Banco" value="RLS" detail="Supabase seguro" />
          <StatCard label="Storage" value="4" detail="Buckets ativos" />
          <StatCard label="Sprint" value="UI" detail="Interface gráfica" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <Card className="overflow-hidden">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[.3em] text-cyan-200/80">Dual Core Online</p>
                <h2 className="mt-2 text-2xl font-black text-white">AURA conversa. ARGUS supervisiona.</h2>
              </div>
              <StatusPill tone="green">infra ativa</StatusPill>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AvatarOrb name="AURA" role="Assistente Universal" variant="aura" />
              <AvatarOrb name="ARGUS" role="Agente Supervisor" variant="argus" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[.3em] text-slate-500">Estado real</p>
                <h2 className="mt-2 text-xl font-black text-white">Baseline do projeto</h2>
              </div>
              <StatusPill>Ready</StatusPill>
            </div>
            <div className="mt-6">
              <MetricRow label="GitHub" value="Configurado" />
              <MetricRow label="Vercel" value="Produção" />
              <MetricRow label="Supabase" value="Criado" />
              <MetricRow label="Interface" value="Em evolução" />
              <MetricRow label="IA real" value="Pendente" />
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card>
            <h2 className="text-xl font-black text-white">Linha do tempo</h2>
            <div className="mt-5 space-y-4">
              {activities.map(([title, detail]) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.8)]" />
                  <div><p className="font-semibold text-slate-200">{title}</p><p className="mt-1 text-slate-500">{detail}</p></div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black text-white">Próximos blocos estruturais</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {nextActions.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <p className="text-xs font-bold tracking-[.25em] text-cyan-200/70">0{index + 1}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
