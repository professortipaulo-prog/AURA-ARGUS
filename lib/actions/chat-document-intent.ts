import type { DocumentFormat } from './types';

export type DocumentIntent = {
  format: DocumentFormat;
  title: string;
  topic: string;
};

const TRIGGER_PATTERNS = [
  /crie?\s+(?:um|uma)?\s*(documento|arquivo|word|pdf|planilha|apresenta[cç][aã]o|excel|powerpoint|relat[oó]rio)/i,
  /gere?\s+(?:um|uma)?\s*(documento|arquivo|word|pdf|planilha|apresenta[cç][aã]o|excel|powerpoint|relat[oó]rio)/i,
  /fa[cç]a\s+(?:um|uma)?\s*(documento|arquivo|word|pdf|planilha|apresenta[cç][aã]o|excel|powerpoint|relat[oó]rio)/i,
  /prepare?\s+(?:um|uma)?\s*(documento|arquivo|word|pdf|planilha|apresenta[cç][aã]o|excel|powerpoint|relat[oó]rio)/i
];

function detectFormat(message: string): DocumentFormat {
  const lower = message.toLowerCase();
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('planilha') || lower.includes('excel') || lower.includes('xlsx')) return 'xlsx';
  if (lower.includes('apresenta') || lower.includes('powerpoint') || lower.includes('pptx') || lower.includes('slide')) return 'pptx';
  return 'docx';
}

/**
 * Detecta se a mensagem do chat e um pedido para gerar um documento de
 * verdade (nao so uma pergunta sobre o assunto). Heuristica por padrao de
 * frase (v1) -- cobre os pedidos mais comuns em portugues.
 */
export function detectDocumentIntent(message: string): DocumentIntent | null {
  const matchedTrigger = TRIGGER_PATTERNS.some((pattern) => pattern.test(message));
  if (!matchedTrigger) return null;

  const format = detectFormat(message);

  // Remove o gatilho da frase para usar o restante como topico/titulo,
  // ex: "crie um documento sobre a historia do Brasil" -> "a historia do Brasil"
  const topic = message
    .replace(/crie?|gere?|fa[cç]a|prepare?/i, '')
    .replace(/(?:um|uma)?\s*(documento|arquivo|word|pdf|planilha|apresenta[cç][aã]o|excel|powerpoint|relat[oó]rio)/i, '')
    .replace(/^\s*(sobre|com|para|de)\s+/i, '')
    .trim() || message.trim();

  const title = topic.length > 60 ? `${topic.slice(0, 57)}...` : topic;

  return { format, title: title || 'Documento AURA ARGUS', topic };
}
