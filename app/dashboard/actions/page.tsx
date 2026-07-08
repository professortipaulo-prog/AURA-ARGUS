'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ActionCapability, DocumentFormat, ExecuteActionResult } from '@/lib/actions/types';

const formats: { value: DocumentFormat; label: string; hint: string }[] = [
  { value: 'docx', label: 'Word (.docx)', hint: 'Documento real do Word, nativo' },
  { value: 'xlsx', label: 'Excel (.xlsx)', hint: 'Planilha real do Excel, nativa' },
  { value: 'pptx', label: 'PowerPoint (.pptx)', hint: 'Apresentação real, nativa' },
  { value: 'pdf', label: 'PDF', hint: 'Documento PDF real' },
  { value: 'md', label: 'Markdown', hint: 'Texto estruturado para documentação' },
  { value: 'html', label: 'HTML', hint: 'Página simples para abrir no navegador' },
  { value: 'doc', label: 'Word (HTML)', hint: 'Compatível com Word, mas não é .docx nativo' },
  { value: 'txt', label: 'TXT', hint: 'Texto simples' },
  { value: 'csv', label: 'CSV', hint: 'Tabela simples' },
  { value: 'json', label: 'JSON', hint: 'Dados estruturados' },
  { value: 'svg', label: 'SVG', hint: 'Card visual vetorial' }
];

const templates: Record<DocumentFormat, { title: string; content: string }> = {
  docx: {
    title: 'Relatório executivo AURA ARGUS',
    content: 'Este é um documento .docx real, gerado nativamente pelo Action Engine.\n\nPode ser aberto e editado diretamente no Microsoft Word, sem conversão.'
  },
  xlsx: {
    title: 'Planilha AURA ARGUS',
    content: 'Landing aprovada\nChat aprovado\nAI Router ativo\nMemory Engine validado\nAction Engine com documentos reais'
  },
  pptx: {
    title: 'Apresentação AURA ARGUS',
    content: 'Visão geral do projeto AURA/ARGUS.\n\nStatus atual: núcleo de inteligência, memória e ações já funcionando.\n\nPróxima etapa: documentos reais e integrações externas.'
  },
  pdf: {
    title: 'Relatório em PDF AURA ARGUS',
    content: 'Este é um PDF real, gerado nativamente pelo Action Engine, pronto para download e compartilhamento.'
  },
  md: {
    title: 'Relatório de andamento AURA ARGUS',
    content: '## Objetivo\nRegistrar o andamento do projeto AURA/ARGUS.\n\n## Status\nInterface aprovada, AI Router ativo e memória por projeto em validação.\n\n## Próxima etapa\nAction Engine com geração de documentos e downloads.'
  },
  html: {
    title: 'Página de status AURA ARGUS',
    content: 'Status do sistema: online.\n\nAURA cuida da estratégia e organização. ARGUS cuida da análise, execução e supervisão.'
  },
  doc: {
    title: 'Documento executivo AURA ARGUS',
    content: 'Este documento foi preparado para abertura no Microsoft Word.\n\nInclui objetivo, contexto, status, próximos passos e observações executivas.'
  },
  txt: {
    title: 'Registro simples AURA ARGUS',
    content: 'Registro textual simples gerado pelo Action Engine.'
  },
  csv: {
    title: 'Checklist AURA ARGUS',
    content: 'Landing aprovada\nChat aprovado\nAI Router ativo\nProject Memory em validação\nAction Engine iniciado'
  },
  json: {
    title: 'Contexto AURA ARGUS',
    content: 'Sistema operacional de IA com AURA e ARGUS, contexto por projeto, memória e ações.'
  },
  svg: {
    title: 'AURA ARGUS Action Engine',
    content: 'Card visual gerado pelo Action Engine para validar criação e download de artefatos.'
  }
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function ActionsPage() {
  const [capabilities, setCapabilities] = useState<ActionCapability[]>([]);
  const [title, setTitle] = useState(templates.md.title);
  const [content, setContent] = useState(templates.md.content);
  const [format, setFormat] = useState<DocumentFormat>('md');
  const [result, setResult] = useState<ExecuteActionResult | null>(null);
  const [history, setHistory] = useState<ExecuteActionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkTarget, setLinkTarget] = useState<'url' | 'whatsapp'>('url');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [linkResult, setLinkResult] = useState<ExecuteActionResult | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    fetch('/api/actions/capabilities')
      .then((res) => res.json())
      .then((data) => setCapabilities(data.capabilities ?? []))
      .catch(() => setCapabilities([]));
  }, []);

  const activeCapabilities = useMemo(() => capabilities.filter((item) => item.status === 'active'), [capabilities]);
  const plannedCapabilities = useMemo(() => capabilities.filter((item) => item.status === 'planned'), [capabilities]);

  function selectFormat(nextFormat: DocumentFormat) {
    setFormat(nextFormat);
    setTitle(templates[nextFormat].title);
    setContent(templates[nextFormat].content);
    setResult(null);
  }

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
      if (data.ok) setHistory((current) => [data, ...current].slice(0, 6));
    } finally {
      setLoading(false);
    }
  }

  async function handlePrepareLink() {
    setLinkLoading(true);
    setLinkResult(null);
    try {
      const response = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          linkTarget === 'whatsapp'
            ? { action: 'link.prepare', linkTarget: 'whatsapp', phone: linkPhone, message: linkMessage }
            : { action: 'link.prepare', linkTarget: 'url', url: linkUrl }
        )
      });
      const data = (await response.json()) as ExecuteActionResult;
      setLinkResult(data);
    } finally {
      setLinkLoading(false);
    }
  }

  function downloadArtifact(item = result) {
    if (!item?.artifact) return;
    const link = document.createElement('a');
    link.href = item.artifact.dataUrl;
    link.download = item.artifact.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <section className="aios-page aios-actions-page">
      <header className="aios-page-header">
        <div>
          <p className="aios-kicker">AURA / ARGUS</p>
          <h1>Central de Ações</h1>
          <p>Crie artefatos, baixe arquivos e valide o primeiro executor operacional do sistema.</p>
        </div>
        <div className="aios-status-pill"><span /> Online</div>
      </header>

      <div className="aios-actions-shell">
        <article className="aios-panel aios-action-composer">
          <div className="aios-action-title-row">
            <div>
              <p className="aios-kicker">DOCUMENT ENGINE</p>
              <h2>Gerar arquivo para download</h2>
              <p className="aios-muted">Escolha o formato, revise o conteúdo e clique em gerar.</p>
            </div>
            <div className="aios-action-mini-status">v1 funcional</div>
          </div>

          <div className="aios-format-grid">
            {formats.map((item) => (
              <button
                type="button"
                key={item.value}
                className={item.value === format ? 'aios-format-card active' : 'aios-format-card'}
                onClick={() => selectFormat(item.value)}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </button>
            ))}
          </div>

          <div className="aios-form-grid two">
            <label className="aios-form-control">
              <span>Título do arquivo</span>
              <input className="aios-input" value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="aios-form-control">
              <span>Formato selecionado</span>
              <select className="aios-input" value={format} onChange={(event) => selectFormat(event.target.value as DocumentFormat)}>
                {formats.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <label className="aios-form-control">
            <span>Conteúdo</span>
            <textarea className="aios-textarea aios-action-textarea" value={content} onChange={(event) => setContent(event.target.value)} />
          </label>

          <div className="aios-action-bar">
            <button className="aios-primary-button" onClick={handleCreateDocument} disabled={loading}>
              {loading ? 'Gerando...' : `Gerar ${format.toUpperCase()}`}
            </button>
            {result?.artifact && (
              <button className="aios-secondary-button" onClick={() => downloadArtifact(result)}>Baixar agora</button>
            )}
          </div>

          {result && (
            <div className={result.ok ? 'aios-action-result ok' : 'aios-action-result error'}>
              <strong>{result.ok ? 'Arquivo pronto' : 'Erro na ação'}</strong>
              <p>{result.message}</p>
              {result.artifact && (
                <div className="aios-artifact-card">
                  <div>
                    <b>{result.artifact.fileName}</b>
                    <span>{result.artifact.mimeType} · {formatBytes(result.artifact.sizeBytes)}</span>
                  </div>
                  <button className="aios-secondary-button" onClick={() => downloadArtifact(result)}>Download</button>
                </div>
              )}
              {result.warnings?.map((warning) => <small key={warning}>{warning}</small>)}
            </div>
          )}
        </article>

        <article className="aios-panel aios-action-composer">
          <div className="aios-action-title-row">
            <div>
              <p className="aios-kicker">LINK ENGINE</p>
              <h2>Preparar link ou WhatsApp</h2>
              <p className="aios-muted">Monta a URL ou a mensagem para você revisar e abrir manualmente. Nada é enviado automaticamente.</p>
            </div>
            <div className="aios-action-mini-status">v1 funcional</div>
          </div>

          <div className="aios-format-grid">
            <button
              type="button"
              className={linkTarget === 'url' ? 'aios-format-card active' : 'aios-format-card'}
              onClick={() => setLinkTarget('url')}
            >
              <strong>Abrir URL</strong>
              <span>Site, rádio, GitHub etc.</span>
            </button>
            <button
              type="button"
              className={linkTarget === 'whatsapp' ? 'aios-format-card active' : 'aios-format-card'}
              onClick={() => setLinkTarget('whatsapp')}
            >
              <strong>WhatsApp Web</strong>
              <span>Mensagem preparada com confirmação</span>
            </button>
          </div>

          {linkTarget === 'url' ? (
            <label className="aios-form-control">
              <span>URL completa</span>
              <input className="aios-input" placeholder="https://exemplo.com" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} />
            </label>
          ) : (
            <div className="aios-form-grid two">
              <label className="aios-form-control">
                <span>Número (com DDI+DDD)</span>
                <input className="aios-input" placeholder="5571999999999" value={linkPhone} onChange={(event) => setLinkPhone(event.target.value)} />
              </label>
              <label className="aios-form-control">
                <span>Mensagem</span>
                <input className="aios-input" placeholder="Texto a ser preenchido" value={linkMessage} onChange={(event) => setLinkMessage(event.target.value)} />
              </label>
            </div>
          )}

          <div className="aios-action-bar">
            <button className="aios-primary-button" onClick={handlePrepareLink} disabled={linkLoading}>
              {linkLoading ? 'Preparando...' : 'Preparar link'}
            </button>
            {linkResult?.link && (
              <a className="aios-secondary-button" href={linkResult.link.url} target="_blank" rel="noopener noreferrer">
                Abrir agora
              </a>
            )}
          </div>

          {linkResult && (
            <div className={linkResult.ok ? 'aios-action-result ok' : 'aios-action-result error'}>
              <strong>{linkResult.ok ? 'Link pronto' : 'Erro na ação'}</strong>
              <p>{linkResult.message}</p>
              {linkResult.link && (
                <div className="aios-artifact-card">
                  <div>
                    <b>{linkResult.link.requiresConfirmation ? 'Confirmação necessária' : 'Abertura direta'}</b>
                    <span>{linkResult.link.url}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </article>

        <aside className="aios-actions-sidebar">
          <article className="aios-panel">
            <p className="aios-kicker">COMO TESTAR</p>
            <h2>Teste operacional</h2>
            <ol className="aios-test-list">
              <li>Escolha <b>Markdown</b> e clique em gerar.</li>
              <li>Clique em <b>Download</b> e confirme o arquivo baixado.</li>
              <li>Escolha <b>SVG</b>, gere e abra no navegador.</li>
              <li>Escolha <b>Word compatível</b> e abra no Word.</li>
            </ol>
          </article>

          <article className="aios-panel">
            <p className="aios-kicker">HISTÓRICO LOCAL</p>
            <h2>Últimos arquivos</h2>
            <div className="aios-action-history">
              {history.length === 0 && <p className="aios-muted">Nenhum arquivo gerado nesta sessão.</p>}
              {history.map((item) => item.artifact && (
                <button key={`${item.artifact.fileName}-${item.artifact.sizeBytes}`} onClick={() => downloadArtifact(item)}>
                  <strong>{item.artifact.fileName}</strong>
                  <span>{formatBytes(item.artifact.sizeBytes)}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="aios-panel">
            <p className="aios-kicker">TOOL REGISTRY</p>
            <h2>Capacidades</h2>
            <div className="aios-capability-list">
              {activeCapabilities.map((item) => (
                <div className="aios-capability" key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
            <h2 className="aios-mt">Próximas integrações</h2>
            <div className="aios-capability-list">
              {plannedCapabilities.map((item) => (
                <div className="aios-capability planned" key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
