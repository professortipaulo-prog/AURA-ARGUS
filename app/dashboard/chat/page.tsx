'use client';

import { useEffect, useState } from 'react';
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

function applyAssistantMode(next: Persona) {
  document.documentElement.dataset.assistant = next;
  document.documentElement.classList.toggle('theme-light', next === 'aura');
  window.localStorage.setItem('aura-argus-assistant-mode', next);
  window.localStorage.setItem('aura-argus-theme', next === 'aura' ? 'light' : 'dark');
}

export default function ChatPage() {
  const [persona, setPersona] = useState<Persona>('aura');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá, Paulo. Escolha AURA ou ARGUS, digite sua solicitação e pressione Enter para enviar. Use Shift + Enter para quebrar linha.'
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('aura-argus-assistant-mode') as Persona | null;
    const initial = stored === 'argus' ? 'argus' : 'aura';
    setPersona(initial);
    applyAssistantMode(initial);
  }, []);

  function switchPersona(next: Persona) {
    setPersona(next);
    setAvatarState('idle');
    applyAssistantMode(next);
  }

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
      setTimeout(() => setAvatarState('idle'), 2200);
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
      <section className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-8">
        <Card className="living-chat-card flex min-h-[620px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((msg, i) => {
              if (msg.role === 'error') {
                return (
                  <div key={i} className="max-w-xl rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                    ⚠️ {msg.content}
                  </div>
                );
              }
              return (
                <div key={i} className={msg.role === 'user' ? 'living-msg living-msg-user' : 'living-msg living-msg-assistant'}>
                  {msg.content}
                  {msg.meta ? <div className="mt-3 text-[11px] opacity-50">{msg.meta}</div> : null}
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
          <p className="mt-3 text-xs opacity-60">
            Enter envia. Shift + Enter quebra linha. Persona ativa: {PERSONA_LABEL[persona]}. Provedor: {PERSONA_PROVIDER[persona] === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}.
          </p>
        </Card>
        <div className="space-y-6">
          <div className="living-persona-switch">
            <button type="button" onClick={() => switchPersona('aura')} className={persona === 'aura' ? 'active aura' : ''}>
              AURA
            </button>
            <button type="button" onClick={() => switchPersona('argus')} className={persona === 'argus' ? 'active argus' : ''}>
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
