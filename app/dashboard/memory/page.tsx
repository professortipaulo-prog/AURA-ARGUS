import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getMemoryStats() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return { sessions: 0, messages: 0, memories: 0, last: null as string | null, migrationRequired: false };

  const core = supabase.schema('core');
  const [sessions, messages, memories, latest] = await Promise.all([
    core.from('memory_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'deleted'),
    core.from('memory_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    core.from('memory_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    core.from('memory_sessions').select('last_message_at').eq('user_id', user.id).order('last_message_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()
  ]);

  const migrationRequired = Boolean(sessions.error || messages.error || memories.error);
  return {
    sessions: sessions.count ?? 0,
    messages: messages.count ?? 0,
    memories: memories.count ?? 0,
    last: latest.data?.last_message_at ?? null,
    migrationRequired
  };
}

const layers = [
  {
    title: 'Memória de conversa',
    text: 'Cada interação do chat passa a ser registrada em sessões recuperáveis, com persona, provedor, modelo e histórico.'
  },
  {
    title: 'Memória permanente',
    text: 'Fatos, preferências, projetos e decisões relevantes podem ser transformados em memória do usuário.'
  },
  {
    title: 'Context Builder',
    text: 'Antes da IA responder, AURA/ARGUS recupera perfil inteligente, memórias importantes e conversas recentes.'
  },
  {
    title: 'Base para vetores',
    text: 'A estrutura está pronta para evoluir para embeddings, busca semântica e memória por projeto.'
  }
];

export default async function Page() {
  const stats = await getMemoryStats();
  return (
    <>
      <Header title="Memória" subtitle="EPIC 003 — Memory Engine" />
      <section className="dashboard-page-grid p-5 lg:p-7">
        <Card className="dashboard-main-card lg:col-span-2">
          <p className="section-kicker">MEMORY ENGINE</p>
          <h1 className="mt-3 text-3xl font-black text-white">Memória operacional AURA/ARGUS</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Esta camada registra conversas, cria contexto recuperável e prepara o sistema para lembrar preferências,
            projetos, decisões e histórico de trabalho sem depender apenas do prompt manual.
          </p>
          {stats.migrationRequired ? (
            <div className="mt-5 rounded-3xl border border-amber-400/35 bg-amber-400/10 p-4 text-sm font-bold text-amber-100">
              Migração 0004_memory_engine.sql ainda não aplicada no Supabase.
            </div>
          ) : null}
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-4">
          <Card><p className="section-kicker">SESSÕES</p><strong className="mt-3 block text-4xl text-white">{stats.sessions}</strong><span className="text-sm text-slate-400">conversas registradas</span></Card>
          <Card><p className="section-kicker">MENSAGENS</p><strong className="mt-3 block text-4xl text-white">{stats.messages}</strong><span className="text-sm text-slate-400">itens no histórico</span></Card>
          <Card><p className="section-kicker">MEMÓRIAS</p><strong className="mt-3 block text-4xl text-white">{stats.memories}</strong><span className="text-sm text-slate-400">fatos persistentes</span></Card>
          <Card><p className="section-kicker">ÚLTIMO USO</p><strong className="mt-3 block text-lg text-white">{stats.last ? new Date(stats.last).toLocaleString('pt-BR') : '—'}</strong><span className="text-sm text-slate-400">atividade recente</span></Card>
        </div>

        <div className="grid gap-4 lg:col-span-2 xl:grid-cols-4">
          {layers.map((item) => (
            <Card key={item.title}>
              <h2 className="text-lg font-black text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
