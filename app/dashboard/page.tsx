import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { LivingBackground } from '@/components/living-background';

const activities = ['Banco Supabase configurado', 'Buckets e policies criados', 'Deploy Vercel publicado', 'Profile Engine ativo'];

export default function DashboardPage() {
  return (
    <div className="dashboard-surface agent-argus">
      <LivingBackground mode="argus" />
      <Header title="Painel principal" subtitle="Núcleo operacional AURA/ARGUS." />
      <section className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Status" value="Live" detail="Sistema online" />
          <StatCard label="Banco" value="RLS" detail="Supabase seguro" />
          <StatCard label="IA" value="Auto" detail="Modelos dinâmicos" />
          <StatCard label="Perfil" value="Ativo" detail="Contexto aplicado" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card>
            <h2 className="text-xl font-bold text-white">Central AURA/ARGUS</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Interface operacional para chat, memória, projetos, documentos, agentes e administração.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {['Conversar com IA', 'Criar projeto', 'Enviar documento', 'Configurar agente'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm text-slate-300">{item}</div>)}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-white">Linha do tempo</h2>
            <div className="mt-5 space-y-4">
              {activities.map((item) => <div key={item} className="flex gap-3 text-sm"><span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" /><span className="text-slate-300">{item}</span></div>)}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
