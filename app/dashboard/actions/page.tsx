'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ActionCapability, DocumentFormat, ExecuteActionResult } from '@/lib/actions/types';

const formats: { value: DocumentFormat; label: string }[] = [
  { value: 'md', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'doc', label: 'DOC Word' },
  { value: 'txt', label: 'TXT' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'svg', label: 'SVG' }
];

export default function ActionsPage() {
  const [capabilities, setCapabilities] = useState<ActionCapability[]>([]);
  const [title, setTitle] = useState('Relatorio inicial AURA ARGUS');
  const [content, setContent] = useState('Documento gerado pelo Action Engine.\n\nEste e um teste de criacao de artefato para download.');
  const [format, setFormat] = useState<DocumentFormat>('md');
  const [result, setResult] = useState<ExecuteActionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/actions/capabilities')
      .then((res) => res.json())
      .then((data) => setCapabilities(data.capabilities ?? []))
      .catch(() => setCapabilities([]));
  }, []);

  const activeCapabilities = useMemo(() => capabilities.filter((item) => item.status === 'active'), [capabilities]);
  const plannedCapabilities = useMemo(() => capabilities.filter((item) => item.status === 'planned'), [capabilities]);

  async function handleCreateDocument() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'document.create', title, content, format })
      });
      const data = (await response.json()) as ExecuteActionResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  function downloadArtifact() {
    if (!result?.artifact) return;
    const link = document.createElement('a');
    link.href = result.artifact.dataUrl;
    link.download = result.artifact.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <section className="aios-page aios-actions-page">
      <header className="aios-page-header">
        <div>
          <p className="aios-kicker">AURA / ARGUS</p>
          <h1>Action Engine</h1>
          <p>Executor inicial de acoes, documentos e downloads do sistema.</p>
        </div>
        <div className="aios-status-pill"><span /> Online</div>
      </header>

      <div className="aios-actions-grid">
        <article className="aios-panel aios-action-composer">
          <p className="aios-kicker">DOCUMENT ENGINE</p>
          <h2>Gerar documento</h2>
          <p className="aios-muted">Crie um artefato e baixe diretamente pelo navegador.</p>

          <label className="aios-field-label">Titulo</label>
          <input className="aios-input" value={title} onChange={(event) => setTitle(event.target.value)} />

          <label className="aios-field-label">Formato</label>
          <select className="aios-input" value={format} onChange={(event) => setFormat(event.target.value as DocumentFormat)}>
            {formats.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>

          <label className="aios-field-label">Conteudo</label>
          <textarea className="aios-textarea aios-action-textarea" value={content} onChange={(event) => setContent(event.target.value)} />

          <button className="aios-primary-button" onClick={handleCreateDocument} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar artefato'}
          </button>

          {result && (
            <div className={result.ok ? 'aios-action-result ok' : 'aios-action-result error'}>
              <strong>{result.ok ? 'Concluido' : 'Erro'}</strong>
              <p>{result.message}</p>
              {result.artifact && (
                <button className="aios-secondary-button" onClick={downloadArtifact}>Baixar {result.artifact.fileName}</button>
              )}
              {result.warnings?.map((warning) => <small key={warning}>{warning}</small>)}
            </div>
          )}
        </article>

        <aside className="aios-panel">
          <p className="aios-kicker">TOOL REGISTRY</p>
          <h2>Capacidades ativas</h2>
          <div className="aios-capability-list">
            {activeCapabilities.map((item) => (
              <div className="aios-capability" key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>

          <h2 className="aios-mt">Proximas integracoes</h2>
          <div className="aios-capability-list">
            {plannedCapabilities.map((item) => (
              <div className="aios-capability planned" key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
