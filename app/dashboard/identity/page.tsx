import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { getCurrentUserIdentity } from '@/lib/identity/server';

function StrengthBadge({ value }: { value: 'high' | 'medium' | 'low' }) {
  const label = value === 'high' ? 'alto' : value === 'medium' ? 'médio' : 'baixo';
  const cls = value === 'high' ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100' : value === 'medium' ? 'border-indigo-300/30 bg-indigo-300/10 text-indigo-100' : 'border-amber-300/30 bg-amber-300/10 text-amber-100';
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${cls}`}>{label}</span>;
}

export default async function IdentityPage() {
  const { identity, error } = await getCurrentUserIdentity();

  if (!identity) {
    return (
      <>
        <Header title="Identidade" subtitle="Contexto permanente do usuário." />
        <main className="p-8"><Card><p className="text-sm text-rose-200">{error ?? 'Não autenticado.'}</p></Card></main>
      </>
    );
  }

  return (
    <>
      <Header title="Identity Engine" subtitle="Resumo interno que personaliza AURA e ARGUS sem novos formulários." />
      <main className="grid gap-6 p-5 lg:grid-cols-[1fr_420px] lg:p-8">
        <section className="space-y-6">
          <Card>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Identidade digital</p>
                <h1 className="mt-3 text-3xl font-black text-white">{identity.context.identity.preferredName || identity.context.identity.email}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{identity.summary}</p>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-5 text-center">
                <p className="text-xs text-slate-400">Perfil</p>
                <p className="text-3xl font-black text-cyan-100">{identity.completion}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black text-white">Sinais de contexto</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {identity.signals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{signal.label}</p>
                    <StrengthBadge value={signal.strength} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{signal.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black text-white">Instrução ativa da AURA</h2>
            <p className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-300/10 p-4 text-sm leading-7 text-slate-200">{identity.auraInstruction}</p>
          </Card>

          <Card>
            <h2 className="text-xl font-black text-white">Instrução ativa do ARGUS</h2>
            <p className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-7 text-slate-200">{identity.argusInstruction}</p>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Prompt Builder</p>
            <h2 className="mt-3 text-2xl font-black text-white">Contexto pronto</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Esse bloco já é injetado automaticamente no chat. Você não precisa preencher novos formulários.</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
              {identity.systemPrompt.split('\n').map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black text-white">Lacunas opcionais</h2>
            {identity.gaps.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {identity.gaps.map((gap) => <span key={gap} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">{gap}</span>)}
              </div>
            ) : (
              <p className="mt-4 text-sm text-cyan-100">Nenhuma lacuna crítica detectada.</p>
            )}
          </Card>
        </aside>
      </main>
    </>
  );
}
