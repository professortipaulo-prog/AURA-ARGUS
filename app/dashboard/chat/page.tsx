'use client';

/**
 * app/dashboard/chat/page.tsx
 * Chat placeholder. O botão "Enviar" aqui NÃO chama nenhuma IA — ele
 * apenas simula, localmente, a sequência de estados do avatar
 * (ouvindo → pensando → falando → repouso) para demonstrar a animação
 * pedida pelo Product Owner. Quando a IA real for conectada
 * (modules/ai-router), os mesmos estados devem ser dirigidos pela
 * resposta real do backend, não por um temporizador local como aqui.
 */
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarPanel, type AvatarState } from '@/components/avatar-panel';

export default function ChatPage() {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isSimulating, setIsSimulating] = useState(false);

  function handleSendPlaceholder() {
    if (isSimulating) return;
    setIsSimulating(true);

    // Simulação local apenas para demonstrar a animação do avatar —
    // sem chamada real de IA (fora de escopo nesta sprint).
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
      <Header title="Chat IA" subtitle="Base visual para conversa com AURA e ARGUS." />
      <section className="grid gap-6 p-5 lg:grid-cols-[1fr_340px] lg:p-8">
        <Card className="min-h-[620px]">
          <div className="space-y-4">
            <div className="max-w-xl rounded-3xl bg-white/[.06] p-4 text-sm text-slate-300">Olá, Paulo. Sou o AURA. Nesta Sprint minha interface está pronta; na próxima eu conecto autenticação, memória e provedores de IA.</div>
            <div className="ml-auto max-w-xl rounded-3xl bg-indigo-500 p-4 text-sm text-white">Quero transformar isso em meu assistente profissional completo.</div>
          </div>
          <div className="mt-8 flex gap-3">
            <Textarea rows={3} placeholder="Digite sua solicitação..." disabled={isSimulating} />
            <Button onClick={handleSendPlaceholder} disabled={isSimulating}>
              {isSimulating ? 'Simulando...' : 'Enviar'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Este botão apenas demonstra a animação do avatar (ao lado). Nenhuma IA é chamada nesta sprint.
          </p>
        </Card>
        <div className="space-y-6">
          <AvatarPanel persona="aura" state={avatarState} />
          <Card>
            <h2 className="font-bold text-white">Contexto ativo</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Projeto: AURA/ARGUS</p><p>Modo: Profissional</p><p>Memoria: Preparada</p><p>Roteamento: Gemini / Claude / OpenAI</p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
