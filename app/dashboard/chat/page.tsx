'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarPanel, type AvatarState } from '@/components/avatar-panel';

type Persona = 'aura' | 'argus';
type ChatMessage = { role: 'user' | 'assistant' | 'error'; content: string; meta?: string };

const PERSONA_PROVIDER: Record<Persona, 'anthropic' | 'gemini'> = {
  aura: 'anthropic',
  argus: 'gemini'
};

const PERSONA_LABEL: Record<Persona, string> = {
  aura: 'AURA',
  argus: 'ARGUS'
};

export default function ChatPage() {
  const [persona, setPersona] = useState<Persona>('aura');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Olá, Paulo. Sou a AURA/ARGUS. Escolha AURA ou ARGUS, digite sua solicitação e pressione Enter para enviar. Use Shift + Enter para quebrar linha.'
    }
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
        body: JSON.stringify({
          message: text,
          persona,
          provider: PERSONA_PROVIDER[persona]
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: 'error', content: data.error ?? 'Erro desconhecido ao chamar a IA.' }]);
        setAvatarState('idle');
        return;
      }

      setAvatarState('speaking');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          meta: `${data.persona ?? PERSONA_LABEL[persona]} · ${data.provider} · ${data.model}`
        }
      ]);
      setTimeout(() => setAvatarState('idle'), 1800);
    } catch {
      setMessages((prev) => [...prev, { role: 'error', content: 'Não foi possível contatar /api/ai/chat. Verifique sua conexão.' }]);
      setAvatarState('idle');
    } finally {
      setIsSending(false);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      <Header title="Chat IA" subtitle="AURA e ARGUS conectados à IA real via /api/ai/chat." />
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
                      : 'max-w-xl whitespace-pre-wrap rounded-3xl bg-white/[.06] p-4 text-sm leading-relaxed text-slate-300'
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
              onKeyDown={handleInputKeyDown}
              disabled={isSending}
            />
            <Button onClick={handleSend} disabled={isSending || !input.trim()}>
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Enter envia. Shift + Enter quebra linha. Persona ativa: {PERSONA_LABEL[persona]}. Provedor: {PERSONA_PROVIDER[persona] === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}.
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
              <p>Persona: {PERSONA_LABEL[persona]}</p>
              <p>Provedor: {PERSONA_PROVIDER[persona] === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}</p>
              <p>Identidade: perfil inteligente aplicado automaticamente</p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
