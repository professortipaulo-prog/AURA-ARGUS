'use client';

import { useEffect, useState } from 'react';

type KnowledgeFile = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  extractionStatus: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(status: string): { text: string; tone: 'ok' | 'warn' | 'error' } {
  if (status === 'done') return { text: 'Pronto para consulta pela IA', tone: 'ok' };
  if (status === 'unsupported') return { text: 'Salvo, mas não legível pela IA (formato não suportado)', tone: 'warn' };
  if (status === 'error') return { text: 'Erro ao ler o conteúdo', tone: 'error' };
  return { text: 'Processando...', tone: 'warn' };
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMessage, setReindexMessage] = useState<string | null>(null);

  async function handleReindex() {
    setReindexing(true);
    setReindexMessage(null);
    try {
      const response = await fetch('/api/knowledge/reindex', { method: 'POST' });
      const data = await response.json();
      if (!data.ok) {
        setReindexMessage('Não foi possível atualizar a busca agora.');
        return;
      }
      setReindexMessage(
        data.reindexed > 0
          ? `${data.reindexed} arquivo(s) atualizado(s) para busca por significado.${data.failed > 0 ? ` ${data.failed} falharam.` : ''}`
          : 'Todos os arquivos já estão com a busca por significado atualizada.'
      );
    } finally {
      setReindexing(false);
    }
  }

  async function loadFiles() {
    setLoadingList(true);
    try {
      const response = await fetch('/api/knowledge/list');
      const data = await response.json();
      setFiles(data.files ?? []);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/knowledge/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!data.ok) {
        setError(data.error ?? 'Não foi possível enviar o arquivo.');
      } else {
        await loadFiles();
      }
    } catch {
      setError('Falha de conexão ao enviar o arquivo.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleDelete(id: string) {
    const previous = files;
    setFiles((current) => current.filter((item) => item.id !== id));
    const response = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!data.ok) {
      setError(data.error ?? 'Não foi possível remover o arquivo.');
      setFiles(previous);
    }
  }

  return (
    <section className="aios-page aios-actions-page">
      <header className="aios-page-header">
        <div>
          <p className="aios-kicker">AURA / ARGUS</p>
          <h1>Base de Conhecimento</h1>
          <p>Envie seus documentos (PDF, Word, texto) para que AURA e ARGUS consultem esse material ao responder e ao gerar novos documentos.</p>
        </div>
        <div className="aios-status-pill"><span /> Online</div>
      </header>

      <div className="aios-actions-shell">
        <article className="aios-panel aios-action-composer">
          <div className="aios-action-title-row">
            <div>
              <p className="aios-kicker">KNOWLEDGE HUB</p>
              <h2>Enviar arquivo</h2>
              <p className="aios-muted">Formatos aceitos para leitura pela IA: PDF, Word (.docx), TXT, Markdown. Outros formatos ficam salvos, mas não são lidos.</p>
            </div>
            <div className="aios-action-mini-status">v1 funcional</div>
          </div>

          <label className="aios-form-control">
            <span>Selecionar arquivo</span>
            <input
              className="aios-input"
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {uploading && <p className="aios-muted">Enviando e lendo o arquivo...</p>}
          {error && (
            <div className="aios-action-result error">
              <strong>Erro</strong>
              <p>{error}</p>
            </div>
          )}
        </article>

        <article className="aios-panel aios-action-composer">
          <div className="aios-action-title-row">
            <div>
              <p className="aios-kicker">ARQUIVOS ENVIADOS</p>
              <h2>Seus documentos</h2>
              <p className="aios-muted">A IA consulta automaticamente esses arquivos quando forem relevantes para a pergunta ou o documento pedido — agora buscando por significado, não só palavra-chave.</p>
            </div>
            <button className="aios-secondary-button" onClick={handleReindex} disabled={reindexing}>
              {reindexing ? 'Atualizando busca...' : 'Atualizar busca dos arquivos antigos'}
            </button>
          </div>
          {reindexMessage && <p className="aios-muted">{reindexMessage}</p>}

          {loadingList ? (
            <p className="aios-muted">Carregando...</p>
          ) : files.length === 0 ? (
            <p className="aios-muted">Nenhum arquivo enviado ainda.</p>
          ) : (
            <div className="aios-capability-list">
              {files.map((file) => {
                const status = statusLabel(file.extractionStatus);
                return (
                  <div className="aios-capability" key={file.id}>
                    <div>
                      <strong>{file.fileName}</strong>
                      <p className="aios-muted">
                        {formatSize(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('pt-BR')} · {status.text}
                      </p>
                    </div>
                    <button className="aios-secondary-button" onClick={() => handleDelete(file.id)}>
                      Remover
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
