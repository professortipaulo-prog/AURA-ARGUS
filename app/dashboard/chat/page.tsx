'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { MetricRow } from '@/components/ui/metric-row';
import { StatusPill } from '@/components/ui/status-pill';
import { AvatarPanel, type AvatarState } from '@/components/avatar-panel';

const suggestions = ['Resumir documentos', 'Criar apresentação', 'Analisar e-mails', 'Organizar agenda'];

export default function ChatPage() {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isSimulating, setIsSimulating] = useState(false);

  function handleSendPlaceholder() {
    if (isSimulating) return;
    setIsSimulating(true);
    setAvatarState('listening');
    const t1 = setTimeout(() => setAvatarState('thinking'), 1200);
    const t2 = setTimeout(() => setAvatarState('speaking'), 2600);
    const t3 = setTimeout(() => {
      setAvatarState('idle');
      setIsSimulating(false);
    }, 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }

  return (
    <>
      <Header title="Chat IA" subtitle="Interface preparada para AURA e ARGUS com voz, contexto e memória." />
      <section className="grid gap-6 p-5 lg:grid-cols-[1fr_380px] lg:p-8">
        <Card className="min-h-[650px] overflow-hidden">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[.3em] text-cyan-200/70">Conversa</p>
              <h2 className="mt-2 text-2xl font-black text-white">AURA ativa</h2>
            </div>
            <StatusPill tone="amber">IA pendente</StatusPill>
          </div>
          <div className="space-y-4">
            <div className="max-w-2xl rounded-[1.6rem] border border-cyan-300/15 bg-cyan-300/10 p-5 text-sm leading-7 text-slate-200">
              Olá, Paulo. A interface gráfica foi implementada. O próximo passo real é conectar autenticação, Supabase e provedores de IA.
            </div>
            <div className="ml-auto max-w-2xl rounded-[1.6rem] bg-indigo-500 p-5 text-sm leading-7 text-white shadow-lg shadow-indigo-500/20">
              Quero que você funcione como meu assistente profissional com memória, documentos, voz e ações.
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {suggestions.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-3 text-center text-xs font-semibold text-slate-400">{item}</div>)}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Textarea rows={3} placeholder="Digite sua solicitação para AURA..." disabled={isSimulating} />
            <Button onClick={handleSendPlaceholder} disabled={isSimulating} className="sm:w-32">
              {isSimulating ? 'Simulando...' : 'Enviar'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Nesta etapa o botão simula estados do avatar. A IA real entra na próxima camada.</p>
        </Card>
        <div className="space-y-6">
          <AvatarPanel persona="aura" state={avatarState} />
          <Card>
            <h2 className="text-xl font-black text-white">Contexto ativo</h2>
            <div className="mt-5">
              <MetricRow label="Projeto" value="AURA/ARGUS" />
              <MetricRow label="Modo" value="Profissional" />
              <MetricRow label="Memória" value="Preparada" />
              <MetricRow label="Roteamento" value="Claude/Gemini" />
              <MetricRow label="Voz" value="Planejada" />
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
