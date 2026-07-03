'use client';

/**
 * app/dashboard/chat/page.tsx
 * Chat conectado à IA REAL via /api/ai/chat (lib/ai/ai-router.ts).
 * Cada persona usa um provedor diferente por padrão — AURA → Anthropic
 * (redação/raciocínio), ARGUS → Gemini (respostas técnicas rápidas) —
 * mas isso é só uma escolha de demonstração; qualquer um funciona com
 * qualquer provedor.
 *
 * Se a chave do provedor não estiver configurada na Vercel
 * (ANTHROPIC_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY), a rota retorna um
 * erro amigável (HTTP 503) e é isso que aparece na tela — nada é
 * simulado ou inventado quando a IA não responde de verdade.
 */
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarPanel, type AvatarState } from '@/components/avatar-panel';

type ChatMessage = { role: 'user' | 'assistant' | 'error'; content: string; meta?: string };

const PERSONA_PROVIDER = {
  aura: 'anthropic',
  argus: 'gemini'
} as const;

export default function ChatPage() {
  const [persona, setPersona] = useState<'aura' | 'argus'>('aura');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá, Paulo. Sou a AURA/ARGUS. Digite algo e clique em Enviar — já estou conectada à rota real de IA (/api/ai/chat).' }
  ]);
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsSending(true);
    setAvatarState('thinking');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, provider: PERSONA_PROVIDER[persona] })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: 'error', content: data.error ?? 'Erro desconhecido ao chamar a IA.' }]);
        setAvatarState('idle');
        return;
      }

      setAvatarState('speaking');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, meta: `${data.provider} · ${data.model}` }]);
      setTimeout(() => setAvatarState('idle'), 1800);
    } catch {
      setMessages((prev) => [...prev, { role: 'error', content: 'Não foi possível contatar /api/ai/chat. Verifique sua conexão.' }]);
      setAvatarState('idle');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <Header title="Chat IA" subtitle="Conectado à IA real via /api/ai/chat." />
      <section className="grid gap-6 p-5 lg:grid-cols-[1fr_340px] lg:p-8">
        <Card className="flex min-h-[620px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto">
            {messages.map((msg, i) => {
              if (msg.role === 'error') {
                return (
                  <div key={i} className="max-w-xl rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                    ⚠️ {msg.content}
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className={
                    msg.role === 'user'
                      ? 'ml-auto max-w-xl rounded-3xl bg-indigo-500 p-4 text-sm text-white'
                      : 'max-w-xl rounded-3xl bg-white/[.06] p-4 text-sm text-slate-300'
                  }
                >
                  {msg.content}
                  {msg.meta ? <div className="mt-3 text-[11px] text-slate-500">{msg.meta}</div> : null}
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex gap-3">
            <Textarea
              rows={3}
              placeholder="Digite sua solicitação..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
            />
            <Button onClick={handleSend} disabled={isSending || !input.trim()}>
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Chama {PERSONA_PROVIDER[persona] === 'anthropic' ? 'Anthropic' : 'Gemini'} via /api/ai/chat. O modelo é selecionado automaticamente a partir dos modelos disponíveis em /api/ai/models.
          </p>
        </Card>
        <div className="space-y-6">
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-1">
            <button
              type="button"
              onClick={() => setPersona('aura')}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${persona === 'aura' ? 'bg-brand-violet text-white' : 'text-slate-400 hover:text-white'}`}
            >
              AURA
            </button>
            <button
              type="button"
              onClick={() => setPersona('argus')}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${persona === 'argus' ? 'bg-brand-cyan text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              ARGUS
            </button>
          </div>
          <AvatarPanel persona={persona} state={avatarState} />
          <Card>
            <h2 className="font-bold text-white">Contexto ativo</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Projeto: AURA/ARGUS</p>
              <p>Persona: {persona === 'aura' ? 'AURA' : 'ARGUS'}</p>
              <p>Provedor: {PERSONA_PROVIDER[persona] === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}</p>
              <p>Memória: ainda não persistente (fora de escopo)</p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
