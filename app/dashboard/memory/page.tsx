'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';

type MemoryStatus = {
  migrationApplied?: boolean;
  sessions?: number;
  messages?: number;
  memories?: number;
  lastUse?: string | null;
  projects?: number;
};

type LocalMemoryStatus = {
  sessions: number;
  messages: number;
  memories: number;
  lastUse: string | null;
};

const LOCAL_MEMORY_KEY = 'aura-argus-chat-local-memory-v1';
const LOCAL_MEMORY_STATS_KEY = 'aura-argus-chat-local-stats-v1';

function readLocalStatus(): LocalMemoryStatus {
  if (typeof window === 'undefined') return { sessions: 0, messages: 0, memories: 0, lastUse: null };
  try {
    const statsRaw = window.localStorage.getItem(LOCAL_MEMORY_STATS_KEY);
    const stats = statsRaw ? JSON.parse(statsRaw) : null;
    const memoriesRaw = window.localStorage.getItem(LOCAL_MEMORY_KEY);
    const memories = memoriesRaw ? JSON.parse(memoriesRaw) : [];
    const memoryCount = Array.isArray(memories) ? memories.length : 0;

    return {
      sessions: Number(stats?.sessions ?? 0),
      messages: Number(stats?.messages ?? 0),
      memories: Math.max(Number(stats?.memories ?? 0), memoryCount),
      lastUse: typeof stats?.lastUse === 'string' ? stats.lastUse : null
    };
  } catch {
    return { sessions: 0, messages: 0, memories: 0, lastUse: null };
  }
}

export default function MemoryPage() {
  const [status, setStatus] = useState<MemoryStatus | null>(null);
  const [localStatus, setLocalStatus] = useState<LocalMemoryStatus>({ sessions: 0, messages: 0, memories: 0, lastUse: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalStatus(readLocalStatus());

    function refreshLocalStatus() {
      setLocalStatus(readLocalStatus());
    }

    window.addEventListener('storage', refreshLocalStatus);
    window.addEventListener('focus', refreshLocalStatus);

    let active = true;

    async function load() {
      try {
        const response = await fetch('/api/memory/status', { cache: 'no-store' });
        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          setError(data.error ?? 'Não foi possível carregar a memória.');
          return;
        }

        setStatus(data.status ?? null);
      } catch {
        if (active) setError('Não foi possível consultar o Memory Engine.');
      }
    }

    void load();

    return () => {
      active = false;
      window.removeEventListener('storage', refreshLocalStatus);
      window.removeEventListener('focus', refreshLocalStatus);
    };
  }, []);

  const sessions = Math.max(status?.sessions ?? 0, localStatus.sessions);
  const messages = Math.max(status?.messages ?? 0, localStatus.messages);
  const memories = Math.max(status?.memories ?? 0, localStatus.memories);
  const lastUseSource = status?.lastUse ?? localStatus.lastUse;
  const lastUse = lastUseSource ? new Date(lastUseSource).toLocaleString('pt-BR') : '—';

  return (
    <>
      <Header title="Memória" subtitle="EPIC 003 — Memory Engine" />

      <section className="memory-engine-page">
        <article className="memory-hero-card">
          <div className="memory-hero-eyebrow">MEMORY ENGINE</div>
          <div className="memory-hero-content">
            <p>Memória operacional AURA/ARGUS</p>
            <h1>Esta camada registra conversas, cria contexto recuperável e prepara o sistema para lembrar preferências, projetos, decisões e histórico de trabalho sem depender apenas do prompt manual.</h1>
          </div>

          {error ? <div className="memory-warning">{error}</div> : null}
          {!error && status?.migrationApplied ? <div className="memory-ok">Memory Engine aplicado e operacional.</div> : null}
        </article>

        <div className="memory-stats-grid">
          <article>
            <strong>SESSÕES</strong>
            <b>{sessions}</b>
            <span>conversas registradas</span>
          </article>
          <article>
            <strong>MENSAGENS</strong>
            <b>{messages}</b>
            <span>itens no histórico</span>
          </article>
          <article>
            <strong>MEMÓRIAS</strong>
            <b>{memories}</b>
            <span>fatos persistentes</span>
          </article>
          <article>
            <strong>ÚLTIMO USO</strong>
            <b>{lastUse}</b>
            <span>atividade recente</span>
          </article>
        </div>

        <div className="memory-info-grid">
          <article>
            <h2>Memória de conversa</h2>
            <p>Cada interação do chat passa a ser registrada em sessões recuperáveis, com persona, provedor, modelo e histórico.</p>
          </article>
          <article>
            <h2>Memória permanente</h2>
            <p>Fatos, preferências, projetos e decisões relevantes podem ser transformados em memória persistente.</p>
          </article>
          <article>
            <h2>Context Builder</h2>
            <p>Antes da IA responder, AURA/ARGUS recuperam perfil inteligente, memórias importantes e conversas recentes.</p>
          </article>
          <article>
            <h2>Base para vetores</h2>
            <p>A estrutura está pronta para evoluir para embeddings, busca semântica e memória por projeto.</p>
          </article>
        </div>
      </section>
    </>
  );
}
