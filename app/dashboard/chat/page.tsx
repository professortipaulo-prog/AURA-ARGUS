'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { LivingBackground } from '@/components/living-background';

type Persona = 'aura' | 'argus';
type ChatMessage = {
  role: 'user' | 'assistant' | 'error';
  content: string;
  meta?: string;
  persona?: Persona;
  time?: string;
};

const PERSONA_PROVIDER: Record<Persona, 'anthropic' | 'gemini'> = {
  aura: 'anthropic',
  argus: 'gemini'
};

const personaCopy = {
  aura: {
    label: 'AURA',
    subtitle: 'Assistente Estratégica',
    intro:
      'Olá, Paulo. Sou a AURA, sua assistente estratégica. Vou ajudar você a organizar ideias, transformar demandas em entregáveis e tomar decisões com contexto.',
    placeholder: 'Digite sua mensagem para AURA...',
    image: '/avatars/aura.webp'
  },
  argus: {
    label: 'ARGUS',
    subtitle: 'Assistente Operacional',
    intro:
      'ARGUS online. Pronto para análise técnica, execução, automação, arquitetura, código e supervisão operacional.',
    placeholder: 'Digite sua solicitação para ARGUS...',
    image: '/avatars/argus.webp'
  }
};

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const [persona, setPersona] = useState<Persona>('aura');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: personaCopy.aura.intro, persona: 'aura', time: now(), meta: 'AURA ativa' }
  ]);
  const [isSending, setIsSending] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const active = personaCopy[persona];
  const provider = PERSONA_PROVIDER[persona];

  useEffect(() => {
    document.documentElement.dataset.assistantTheme = persona;
    window.localStorage.setItem('aura-argus-mode', persona);
  }, [persona]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  function switchPersona(next: Persona) {
    if (next === persona) return;
    setPersona(next);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: personaCopy[next].intro,
        persona: next,
        time: now(),
        meta: `${personaCopy[next].label} ativa`
      }
    ]);
    setTimeout(() => inputRef.current?.focus(), 40);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    const activePersona = persona;
    const activeProvider = PERSONA_PROVIDER[activePersona];
    const activeLabel = personaCopy[activePersona].label;

    setMessages((prev) => [...prev, { role: 'user', content: text, time: now(), persona: activePersona }]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, provider: activeProvider, persona: activePersona })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'error', content: data.error ?? 'Erro desconhecido ao chamar a IA.', time: now(), persona: activePersona }
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          meta: `${activeLabel} · ${data.provider} · ${data.model}`,
          persona: activePersona,
          time: now()
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: 'Não foi possível contatar /api/ai/chat. Verifique sua conexão.',
          time: now(),
          persona: activePersona
        }
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }

  return (
    <>
      <LivingBackground persona={persona} />
      <Header title="Chat IA" subtitle="Online" />

      <section className="aios-chat-shell">
        <div className="aios-chat-stage">
          <header className="aios-persona-dock" aria-label="Selecionar assistente">
            <button
              type="button"
              onClick={() => switchPersona('aura')}
              className={`persona-dock-card aura ${persona === 'aura' ? 'is-active' : 'is-muted'}`}
              aria-pressed={persona === 'aura'}
            >
              <span className="persona-dock-avatar">
                <Image src="/avatars/aura.webp" alt="Avatar AURA" fill sizes="120px" />
              </span>
              <span>
                <strong>AURA</strong>
                <small>Estratégia, clareza e organização</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchPersona('argus')}
              className={`persona-dock-card argus ${persona === 'argus' ? 'is-active' : 'is-muted'}`}
              aria-pressed={persona === 'argus'}
            >
              <span className="persona-dock-avatar">
                <Image src="/avatars/argus.webp" alt="Avatar ARGUS" fill sizes="120px" />
              </span>
              <span>
                <strong>ARGUS</strong>
                <small>Execução, análise e supervisão</small>
              </span>
            </button>
          </header>

          <main className="aios-chat-console">
            <div className="aios-message-stream" ref={streamRef}>
              {messages.map((msg, index) => {
                const p = msg.persona ?? persona;
                const isLatest = index === messages.length - 1;

                if (msg.role === 'error') {
                  return (
                    <article key={index} className="aios-error-message is-latest">
                      <strong>Falha operacional</strong>
                      <p>{msg.content}</p>
                    </article>
                  );
                }

                if (msg.role === 'user') {
                  return (
                    <article key={index} className={`aios-message user-message ${isLatest ? 'is-latest' : ''}`}>
                      <p>{msg.content}</p>
                      <time>{msg.time}</time>
                    </article>
                  );
                }

                return (
                  <article key={index} className={`aios-message assistant-message ${p} ${isLatest ? 'is-latest' : ''}`}>
                    <strong>
                      {personaCopy[p].label} <span>• {personaCopy[p].subtitle}</span>
                    </strong>
                    <p>{msg.content}</p>
                    {msg.meta ? <small>{msg.meta}</small> : null}
                    <time>{msg.time}</time>
                  </article>
                );
              })}

              {isSending ? (
                <article className={`aios-message assistant-message ${persona} is-thinking is-latest`}>
                  <strong>
                    {active.label} <span>• processando</span>
                  </strong>
                  <p>{persona === 'aura' ? 'AURA está organizando a resposta...' : 'ARGUS está analisando a execução...'}</p>
                </article>
              ) : null}
            </div>

            <form
              className="aios-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              <textarea
                ref={inputRef}
                rows={2}
                placeholder={active.placeholder}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isSending}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <button type="submit" disabled={isSending || !input.trim()} aria-label="Enviar mensagem">
                ✦
              </button>
              <span>
                Enter envia • Shift + Enter quebra linha • Persona ativa: {active.label}
              </span>
            </form>
          </main>
        </div>
      </section>
    </>
  );
}
