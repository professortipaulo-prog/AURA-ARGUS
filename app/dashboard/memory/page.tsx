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

type LocalMemoryStats = {
  sessions: number;
  messages: number;
  memories: number;
  lastUse: string | null;
};

const LOCAL_MEMORY_KEY = 'aura-argus-chat-local-memory-v1';
const LOCAL_MEMORY_STATS_KEY = 'aura-argus-chat-local-stats-v1';

function readLocalMemoryStats(): LocalMemoryStats {
  if (typeof window === 'undefined') return { sessions: 0, messages: 0, memories: 0, lastUse: null };

  try {
    const rawStats = window.localStorage.getItem(LOCAL_MEMORY_STATS_KEY);
    const parsedStats = rawStats ? JSON.parse(rawStats) : null;
    const rawMemories = window.localStorage.getItem(LOCAL_MEMORY_KEY);
    const parsedMemories = rawMemories ? JSON.parse(rawMemories) : [];
    const memoryCount = Array.isArray(parsedMemories) ? parsedMemories.filter((item) => item?.title && item?.content).length : 0;

    return {
      sessions: Number(parsedStats?.sessions ?? (memoryCount > 0 ? 1 : 0)),
      messages: Number(parsedStats?.messages ?? 0),
      memories: Math.max(Number(parsedStats?.memories ?? 0), memoryCount),
      lastUse: typeof parsedStats?.lastUse === 'string' ? parsedStats.lastUse : null
    };
  } catch {
    return { sessions: 0, messages: 0, memories: 0, lastUse: null };
  }
}

export default function MemoryPage() {
  const [status, setStatus] = useState<MemoryStatus | null>(null);
  const [localStats, setLocalStats] = useState<LocalMemoryStats>({ sessions: 0, messages: 0, memories: 0, lastUse: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalStats(readLocalMemoryStats());
  }, []);

  useEffect(() => {
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
    };
  }, []);

  const sessions = Math.max(status?.sessions ?? 0, localStats.sessions);
  const messages = Math.max(status?.messages ?? 0, localStats.messages);
  const memories = Math.max(status?.memories ?? 0, localStats.memories);
  const lastUseIso = status?.lastUse ?? localStats.lastUse;
  const lastUse = lastUseIso ? new Date(lastUseIso).toLocaleString('pt-BR') : '—';

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
