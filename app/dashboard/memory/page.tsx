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

export default function MemoryPage() {
  const [status, setStatus] = useState<MemoryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    return () => { active = false; };
  }, []);

  const sessions = status?.sessions ?? 0;
  const messages = status?.messages ?? 0;
  const memories = status?.memories ?? 0;
  const lastUse = status?.lastUse ? new Date(status.lastUse).toLocaleString('pt-BR') : '—';

  return (
    <>
      <Header title="Memória" subtitle="EPIC 003 — Memory Engine" />
      <section className="memory-engine-page">
        <article className="memory-hero-card">
          <p>MEMORY ENGINE</p>
          <h1>Memória operacional AURA/ARGUS</h1>
          <span>
            Esta camada registra conversas, cria contexto recuperável e prepara o sistema para lembrar preferências,
            projetos, decisões e histórico de trabalho sem depender apenas do prompt manual.
          </span>
          {error ? <div className="memory-warning">{error}</div> : null}
          {!error && status?.migrationApplied ? <div className="memory-ok">Memory Engine aplicado e operacional.</div> : null}
        </article>

        <div className="memory-stats-grid">
          <article><strong>SESSÕES</strong><b>{sessions}</b><span>conversas registradas</span></article>
          <article><strong>MENSAGENS</strong><b>{messages}</b><span>itens no histórico</span></article>
          <article><strong>MEMÓRIAS</strong><b>{memories}</b><span>fatos persistentes</span></article>
          <article><strong>ÚLTIMO USO</strong><b>{lastUse}</b><span>atividade recente</span></article>
        </div>

        <div className="memory-info-grid">
          <article><h2>Memória de conversa</h2><p>Cada interação do chat passa a ser registrada em sessões recuperáveis, com persona, provedor, modelo e histórico.</p></article>
          <article><h2>Memória permanente</h2><p>Fatos, preferências, projetos e decisões relevantes podem ser transformados em memória persistente.</p></article>
          <article><h2>Context Builder</h2><p>Antes da IA responder, AURA/ARGUS recuperam perfil inteligente, memórias importantes e conversas recentes.</p></article>
          <article><h2>Base para vetores</h2><p>A estrutura está pronta para evoluir para embeddings, busca semântica e memória por projeto.</p></article>
        </div>
      </section>
    </>
  );
}
