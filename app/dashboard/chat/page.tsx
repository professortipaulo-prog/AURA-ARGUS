'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/header';
import { AvatarPanel, type AvatarState } from '@/components/avatar-panel';
import { LivingBackground } from '@/components/living-background';

type Persona = 'aura' | 'argus';
type ChatMessage = { role: 'user' | 'assistant' | 'error'; content: string; meta?: string; persona?: Persona; time?: string };

const PERSONA_PROVIDER: Record<Persona, 'anthropic' | 'gemini'> = {
  aura: 'anthropic',
  argus: 'gemini'
};

const personaCopy = {
  aura: {
    label: 'AURA',
    subtitle: 'Assistente Estratégica',
    intro: 'Olá, Paulo. Sou a AURA, sua assistente estratégica. Posso ajudar com planejamento, escrita, documentos, organização e decisões com contexto.',
    specialty: 'Estratégia, escrita, organização e ensino',
    placeholder: 'Digite sua mensagem para AURA...'
  },
  argus: {
    label: 'ARGUS',
    subtitle: 'Assistente Operacional',
    intro: 'ARGUS online. Pronto para análise técnica, execução, automação, arquitetura, código e supervisão operacional.',
    specialty: 'Execução, automação, software e análise técnica',
    placeholder: 'Digite sua solicitação para ARGUS...'
  }
};

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function createSystemPrompt(persona: Persona) {
  const base = `Você é ${persona === 'aura' ? 'AURA' : 'ARGUS'}, um assistente do sistema AURA/ARGUS. Nunca diga que é Claude, Gemini ou um modelo de linguagem. Responda sempre como ${persona === 'aura' ? 'AURA, assistente estratégica' : 'ARGUS, assistente operacional'}.`;
  const profile = `O usuário é Paulo da Silva Filho. Atua na área de Tecnologia, é Gestor Especialista de TI do SENAI Bahia, professor universitário e trabalha com projetos de IA, desenvolvimento curricular, documentos técnicos, sistemas web e consultoria. Prefere respostas objetivas, práticas, técnicas, com contexto e sem enrolação.`;
  const style = persona === 'aura'
    ? 'Use tom consultivo, claro e estratégico. Ajude a organizar ideias, estruturar documentos, planejar entregas e melhorar decisões. Não exponha JSON interno.'
    : 'Use tom direto, técnico e executivo. Foque em diagnóstico, causa, ação, sequência de implementação e resultado verificável. Não exponha JSON interno.';
  return `${base}\n\n${profile}\n\n${style}`;
}

export default function ChatPage() {
  const [persona, setPersona] = useState<Persona>('aura');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: personaCopy.aura.intro, persona: 'aura', time: now() }
  ]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const active = personaCopy[persona];
  const provider = PERSONA_PROVIDER[persona];

  useEffect(() => {
    document.documentElement.dataset.assistantTheme = persona;
    window.localStorage.setItem('aura-argus-mode', persona);
  }, [persona]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const assistantGreeting = useMemo(() => active.intro, [active.intro]);

  function switchPersona(next: Persona) {
    setPersona(next);
    setAvatarState('idle');
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: personaCopy[next].intro, persona: next, time: now(), meta: `${personaCopy[next].label} ativa` }
    ]);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: 'user', content: text, time: now() }]);
    setInput('');
    setIsSending(true);
    setAvatarState('thinking');

    const systemPrompt = createSystemPrompt(persona);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, provider, persona, systemPrompt })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: 'error', content: data.error ?? 'Erro desconhecido ao chamar a IA.', time: now() }]);
        setAvatarState('idle');
        return;
      }

      setAvatarState('speaking');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, meta: `${active.label} · ${data.provider} · ${data.model}`, persona, time: now() }
      ]);
      setTimeout(() => setAvatarState('idle'), 2200);
    } catch {
      setMessages((prev) => [...prev, { role: 'error', content: 'Não foi possível contatar /api/ai/chat. Verifique sua conexão.', time: now() }]);
      setAvatarState('idle');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <LivingBackground persona={persona} />
      <Header title="Chat IA" subtitle="Status: online" />
      <section className="aios-chat-layout">
        <main className="aios-chat-column">
          <div className="aios-persona-switch" role="tablist" aria-label="Selecionar assistente">
            <button type="button" onClick={() => switchPersona('aura')} className={persona === 'aura' ? 'active aura' : ''}>AURA</button>
            <button type="button" onClick={() => switchPersona('argus')} className={persona === 'argus' ? 'active argus' : ''}>ARGUS</button>
          </div>

          <div className="aios-message-stream" ref={scrollRef}>
            <div className={`aios-assistant-row ${persona}`}>
              <div className="aios-mini-avatar"><AvatarPanel persona={persona} state={avatarState} /></div>
              <article className="aios-message assistant-message">
                <strong>{active.label} <span>• {active.subtitle}</span></strong>
                <p>{assistantGreeting}</p>
                <time>{now()}</time>
              </article>
            </div>

            {messages.map((msg, i) => {
              if (msg.role === 'error') {
                return <div key={i} className="aios-error-message">⚠️ {msg.content}</div>;
              }
              if (msg.role === 'user') {
                return (
                  <article key={i} className="aios-message user-message">
                    <p>{msg.content}</p>
                    <time>{msg.time}</time>
                  </article>
                );
              }
              const p = msg.persona ?? persona;
              return (
                <div key={i} className={`aios-assistant-row ${p}`}>
                  <div className="aios-mini-avatar"><AvatarPanel persona={p} state="idle" /></div>
                  <article className="aios-message assistant-message">
                    <strong>{personaCopy[p].label} <span>• {personaCopy[p].subtitle}</span></strong>
                    <p>{msg.content}</p>
                    {msg.meta ? <small>{msg.meta}</small> : null}
                    <time>{msg.time}</time>
                  </article>
                </div>
              );
            })}
            {isSending ? (
              <div className={`aios-assistant-row ${persona}`}>
                <div className="aios-mini-avatar"><AvatarPanel persona={persona} state="thinking" /></div>
                <article className="aios-message assistant-message is-thinking">
                  <strong>{active.label} <span>• processando</span></strong>
                  <p>{persona === 'aura' ? 'AURA está organizando a resposta...' : 'ARGUS está analisando a execução...'}</p>
                </article>
              </div>
            ) : null}
          </div>

          <div className="aios-composer">
            <textarea
              rows={2}
              placeholder={active.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <button type="button" onClick={handleSend} disabled={isSending || !input.trim()} aria-label="Enviar mensagem">
              ✈
            </button>
            <span>Enter para enviar • Shift + Enter para quebra de linha</span>
          </div>
        </main>

        <aside className="aios-chat-side">
          <AvatarPanel persona={persona} state={avatarState} large />
          <article className="aios-panel context-panel">
            <h2>Contexto Ativo</h2>
            <p><span>Projeto atual</span>AURA/ARGUS</p>
            <p><span>Persona</span>{active.label}</p>
            <p><span>Especialidade</span>{active.specialty}</p>
            <p><span>Identidade</span>Perfil inteligente aplicado</p>
            <p><span>Provedor</span>{provider === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}</p>
            <a href="/dashboard/profile">Ver perfil completo →</a>
          </article>
          <article className="aios-panel quick-actions">
            <h2>Acesso rápido</h2>
            <a href="/dashboard/projects">Novo projeto</a>
            <a href="/dashboard/documents">Enviar documento</a>
            <a href="/dashboard/agents">Configurar agente</a>
            <a href="/dashboard/memory">Memória</a>
          </article>
        </aside>
      </section>
    </>
  );
}
