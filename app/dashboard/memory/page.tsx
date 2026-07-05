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

type MemoryDebug = {
  generatedAt: string;
  temporal: {
    datePtBr: string;
    timePtBr: string;
    timezone: string;
  };
  project: { name?: string; slug?: string; description?: string | null } | null;
  recovered: Array<{
    id: string;
    kind: string;
    title: string;
    content: string;
    priority: number;
    salience: number;
    source: 'relevant' | 'project' | 'user';
    tags: string[];
    updatedAt: string | null;
  }>;
  recentSessions: Array<{ id: string; title: string; summary?: string | null; messageCount?: number; lastPersona?: string | null; lastMessageAt?: string | null }>;
  promptPreview: string;
  counts: { sessions: number; messages: number; memories: number; lastActivity: string | null };
};

export default function MemoryPage() {
  const [status, setStatus] = useState<MemoryStatus | null>(null);
  const [debug, setDebug] = useState<MemoryDebug | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

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

  useEffect(() => {
    if (!showDebug) return;
    let active = true;
    async function loadDebug() {
      try {
        const response = await fetch('/api/memory/debug', { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          setDebugError(data.error ?? 'Não foi possível carregar o diagnóstico.');
          return;
        }
        setDebug(data.debug ?? null);
        setDebugError(null);
      } catch {
        if (active) setDebugError('Não foi possível consultar o diagnóstico da memória.');
      }
    }
    void loadDebug();
    return () => { active = false; };
  }, [showDebug]);

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

        <article className="memory-hero-card" style={{ marginTop: 24 }}>
          <p>DEBUG</p>
          <h1>Diagnóstico da memória</h1>
          <span>
            Painel técnico para validar quais memórias foram recuperadas, sua prioridade e o bloco de contexto que será usado no Prompt Builder.
          </span>
          <button
            type="button"
            onClick={() => setShowDebug((value) => !value)}
            style={{
              marginTop: 18,
              border: '1px solid rgba(148,163,184,.25)',
              borderRadius: 14,
              padding: '11px 16px',
              background: 'rgba(255,255,255,.06)',
              color: '#eaf2ff',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {showDebug ? 'Ocultar diagnóstico' : 'Abrir diagnóstico'}
          </button>
        </article>

        {showDebug ? (
          <section className="memory-info-grid" style={{ marginTop: 18 }}>
            {debugError ? <article><h2>Erro no diagnóstico</h2><p>{debugError}</p></article> : null}
            {!debug && !debugError ? <article><h2>Carregando</h2><p>Consultando o Context Builder...</p></article> : null}
            {debug ? (
              <>
                <article>
                  <h2>Projeto ativo</h2>
                  <p>{debug.project?.name ?? 'Projeto não identificado'}</p>
                  <p>{debug.temporal.datePtBr} · {debug.temporal.timePtBr} · {debug.temporal.timezone}</p>
                </article>
                <article>
                  <h2>Contadores</h2>
                  <p>Sessões: {debug.counts.sessions}</p>
                  <p>Mensagens: {debug.counts.messages}</p>
                  <p>Memórias: {debug.counts.memories}</p>
                </article>
                <article style={{ gridColumn: '1 / -1' }}>
                  <h2>Memórias recuperadas por prioridade</h2>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {debug.recovered.length ? debug.recovered.map((item) => (
                      <div key={item.id} style={{ border: '1px solid rgba(148,163,184,.16)', borderRadius: 16, padding: 14, background: 'rgba(255,255,255,.035)' }}>
                        <strong style={{ color: '#fff' }}>[P{item.priority}] {item.title}</strong>
                        <p style={{ margin: '6px 0', color: '#c6d3e7' }}>{item.content}</p>
                        <span style={{ color: '#8ea0b9', fontSize: 12 }}>{item.source} · {item.kind} · salience {item.salience}</span>
                      </div>
                    )) : <p>Nenhuma memória recuperada.</p>}
                  </div>
                </article>
                <article style={{ gridColumn: '1 / -1' }}>
                  <h2>Prompt/Context Builder — prévia técnica</h2>
                  <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', border: '1px solid rgba(148,163,184,.16)', borderRadius: 16, padding: 14, background: 'rgba(0,0,0,.24)', color: '#dbe7ff', fontSize: 12, lineHeight: 1.55 }}>{debug.promptPreview}</pre>
                </article>
              </>
            ) : null}
          </section>
        ) : null}
      </section>
    </>
  );
}
