import type { ActionArtifact, DocumentFormat } from './types';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import ExcelJS from 'exceljs';
import PptxGenJS from 'pptxgenjs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const MIME: Record<DocumentFormat, string> = {
  md: 'text/markdown; charset=utf-8',
  html: 'text/html; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml; charset=utf-8',
  doc: 'application/msword; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf'
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

async function toDocxBuffer(title: string, content: string): Promise<Buffer> {
  const paragraphs = content
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((block) => new Paragraph({ children: [new TextRun(block.replace(/\n/g, ' '))], spacing: { after: 200 } }));

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: 'Gerado pelo AURA/ARGUS Action Engine', spacing: { after: 300 } }),
          ...(paragraphs.length ? paragraphs : [new Paragraph({ text: 'Documento sem conteudo informado.' })])
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

async function toXlsxBuffer(title: string, content: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AURA/ARGUS Action Engine';
  const sheet = workbook.addWorksheet(title.slice(0, 30) || 'Documento');

  sheet.columns = [
    { header: 'Titulo', key: 'title', width: 32 },
    { header: 'Linha', key: 'line', width: 80 }
  ];
  sheet.getRow(1).font = { bold: true };

  const rows = content.split('\n').filter(Boolean);
  if (rows.length === 0) {
    sheet.addRow({ title, line: 'Documento sem conteudo informado.' });
  } else {
    rows.forEach((line) => sheet.addRow({ title, line }));
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

async function toPptxBuffer(title: string, content: string): Promise<Buffer> {
  const pptx = new PptxGenJS();
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  const titleSlide = pptx.addSlide();
  titleSlide.addText(title, { x: 0.6, y: 1.8, w: 9, h: 1.2, fontSize: 32, bold: true, color: '0F172A' });
  titleSlide.addText('Gerado pelo AURA/ARGUS Action Engine', { x: 0.6, y: 3, w: 9, h: 0.5, fontSize: 14, color: '64748B' });

  const contentBlocks = blocks.length ? blocks : ['Documento sem conteudo informado.'];
  for (const block of contentBlocks) {
    const slide = pptx.addSlide();
    slide.addText(block.slice(0, 900), { x: 0.6, y: 0.6, w: 9, h: 5, fontSize: 18, color: '0F172A', valign: 'top' });
  }

  const arrayBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}

async function toPdfBuffer(title: string, content: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  const bodySize = 12;
  const lineHeight = 16;

  function wrapText(text: string): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const attempt = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(attempt, bodySize) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = attempt;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const paragraphs = content.split(/\n{2,}/).filter(Boolean);
  const bodyLines = (paragraphs.length ? paragraphs : ['Documento sem conteudo informado.'])
    .flatMap((p) => [...wrapText(p), '']);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;

  page.drawText(title.slice(0, 90), { x: margin, y: cursorY, size: 22, font: boldFont, color: rgb(0.06, 0.09, 0.16) });
  cursorY -= 30;
  page.drawText('Gerado pelo AURA/ARGUS Action Engine', { x: margin, y: cursorY, size: 10, font, color: rgb(0.4, 0.45, 0.53) });
  cursorY -= 26;

  for (const line of bodyLines) {
    if (cursorY < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - margin;
    }
    if (line) page.drawText(line, { x: margin, y: cursorY, size: bodySize, font, color: rgb(0.07, 0.09, 0.14) });
    cursorY -= lineHeight;
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
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

const BINARY_FORMATS = new Set<DocumentFormat>(['docx', 'xlsx', 'pptx', 'pdf']);

export async function createDocumentArtifact(params: { title: string; content: string; format?: DocumentFormat }): Promise<ActionArtifact> {
  const format = params.format ?? 'md';
  const title = params.title?.trim() || 'Documento AURA ARGUS';
  const content = params.content?.trim() || 'Conteudo inicial gerado pelo AURA/ARGUS.';

  let buffer: Buffer;
  if (BINARY_FORMATS.has(format)) {
    switch (format) {
      case 'docx':
        buffer = await toDocxBuffer(title, content);
        break;
      case 'xlsx':
        buffer = await toXlsxBuffer(title, content);
        break;
      case 'pptx':
        buffer = await toPptxBuffer(title, content);
        break;
      case 'pdf':
      default:
        buffer = await toPdfBuffer(title, content);
        break;
    }
  } else {
    buffer = Buffer.from(renderDocument(format, title, content), 'utf8');
  }

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
