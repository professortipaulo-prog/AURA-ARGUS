'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { AvatarPanel, type AvatarState } from '@/components/avatar-panel';
import { LivingBackground } from '@/components/living-background';

type ChatMessage = { role: 'user' | 'assistant' | 'error'; content: string; meta?: string };

const PERSONA_PROVIDER = { aura: 'anthropic', argus: 'gemini' } as const;

export default function ChatPage() {
  const [persona, setPersona] = useState<'aura' | 'argus'>('argus');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá, Paulo. Escolha AURA ou ARGUS e envie sua solicitação. Use Enter para enviar e Shift + Enter para quebrar linha.' }
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
        body: JSON.stringify({ message: text, provider: PERSONA_PROVIDER[persona], persona })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessages((prev) => [...prev, { role: 'error', content: data.error ?? 'Erro desconhecido ao chamar a IA.' }]);
        setAvatarState('idle');
        return;
      }
      setAvatarState('speaking');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, meta: `${persona.toUpperCase()} · ${data.provider} · ${data.model}` }]);
      setTimeout(() => setAvatarState('idle'), 1800);
    } catch {
      setMessages((prev) => [...prev, { role: 'error', content: 'Não foi possível contatar /api/ai/chat. Verifique sua conexão.' }]);
      setAvatarState('idle');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={`dashboard-surface agent-${persona}`}>
      <LivingBackground mode={persona} />
      <Header title="Chat IA" subtitle="Status: online" />
      <section className="chat-workspace">
        <main className="chat-card">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              msg.role === 'error' ? (
                <div key={i} className="chat-error">⚠️ {msg.content}</div>
              ) : (
                <div key={i} className={msg.role === 'user' ? 'chat-bubble chat-user' : 'chat-bubble chat-assistant'}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.meta ? <div className="chat-meta">{msg.meta}</div> : null}
                </div>
              )
            ))}
          </div>
          <div className="chat-composer">
            <textarea
              rows={3}
              placeholder="Digite sua solicitação..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend} disabled={isSending || !input.trim()}>{isSending ? '...' : 'Enviar'}</button>
          </div>
          <p className="chat-help">Enter envia. Shift + Enter quebra linha. Persona ativa: {persona.toUpperCase()}.</p>
        </main>
        <aside className="chat-side">
          <div className="persona-switch">
            <button onClick={() => setPersona('aura')} className={persona === 'aura' ? 'active' : ''}>AURA</button>
            <button onClick={() => setPersona('argus')} className={persona === 'argus' ? 'active' : ''}>ARGUS</button>
          </div>
          <AvatarPanel persona={persona} state={avatarState} />
          <div className="context-card">
            <h2>Contexto ativo</h2>
            <p>Projeto: AURA/ARGUS</p>
            <p>Persona: {persona.toUpperCase()}</p>
            <p>Status: Online</p>
            <p>Identidade: perfil inteligente aplicado automaticamente</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
