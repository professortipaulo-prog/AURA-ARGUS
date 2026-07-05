import type { ActionArtifact, DocumentFormat } from './types';

const MIME: Record<DocumentFormat, string> = {
  md: 'text/markdown; charset=utf-8',
  html: 'text/html; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml; charset=utf-8',
  doc: 'application/msword; charset=utf-8'
};

function sanitizeFileName(input: string): string {
  return (input || 'documento-aura-argus')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'documento-aura-argus';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toHtml(title: string, content: string): string {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #111827; line-height: 1.55; }
  h1 { color: #0f172a; }
  p { margin: 0 0 14px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<div class="meta">Gerado pelo AURA/ARGUS Action Engine</div>
${paragraphs || '<p>Documento sem conteudo informado.</p>'}
</body>
</html>`;
}

function toCsv(title: string, content: string): string {
  const rows = content.split('\n').filter(Boolean);
  const escaped = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return ['"titulo","linha"', ...rows.map((row) => `${escaped(title)},${escaped(row)}`)].join('\n');
}

function toSvg(title: string, content: string): string {
  const safeTitle = escapeHtml(title);
  const safeContent = escapeHtml(content.slice(0, 220));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#111827"/><stop offset=".55" stop-color="#172554"/><stop offset="1" stop-color="#581c87"/></linearGradient>
  </defs>
  <rect width="1200" height="675" rx="36" fill="url(#g)"/>
  <circle cx="1030" cy="120" r="190" fill="#22d3ee" opacity=".18"/>
  <circle cx="220" cy="540" r="220" fill="#a855f7" opacity=".22"/>
  <text x="72" y="115" font-family="Arial" font-size="28" fill="#67e8f9" letter-spacing="8">AURA / ARGUS</text>
  <text x="72" y="210" font-family="Arial" font-size="54" font-weight="700" fill="#ffffff">${safeTitle}</text>
  <foreignObject x="72" y="260" width="980" height="250"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial;color:#dbeafe;font-size:28px;line-height:1.35">${safeContent}</div></foreignObject>
  <text x="72" y="610" font-family="Arial" font-size="20" fill="#93c5fd">Gerado pelo Action Engine</text>
</svg>`;
}

function renderDocument(format: DocumentFormat, title: string, content: string): string {
  switch (format) {
    case 'html':
    case 'doc':
      return toHtml(title, content);
    case 'txt':
      return `${title}\n\n${content}`;
    case 'csv':
      return toCsv(title, content);
    case 'json':
      return JSON.stringify({ title, content, generatedBy: 'AURA/ARGUS Action Engine', createdAt: new Date().toISOString() }, null, 2);
    case 'svg':
      return toSvg(title, content);
    case 'md':
    default:
      return `# ${title}\n\n${content}\n\n---\nGerado pelo AURA/ARGUS Action Engine.`;
  }
}

export function createDocumentArtifact(params: { title: string; content: string; format?: DocumentFormat }): ActionArtifact {
  const format = params.format ?? 'md';
  const title = params.title?.trim() || 'Documento AURA ARGUS';
  const content = params.content?.trim() || 'Conteudo inicial gerado pelo AURA/ARGUS.';
  const body = renderDocument(format, title, content);
  const buffer = Buffer.from(body, 'utf8');
  const extension = format;
  const fileName = `${sanitizeFileName(title)}.${extension}`;
  const mimeType = MIME[format];
  const contentBase64 = buffer.toString('base64');

  return {
    fileName,
    mimeType,
    extension,
    sizeBytes: buffer.length,
    contentBase64,
    dataUrl: `data:${mimeType};base64,${contentBase64}`
  };
}
