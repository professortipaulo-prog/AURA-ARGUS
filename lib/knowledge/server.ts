import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const BUCKET = 'knowledge-hub';

export type KnowledgeFile = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  extractionStatus: string;
};

type ExtractionResult = { text: string | null; status: 'done' | 'unsupported' | 'error'; error: string | null };

async function extractText(buffer: Buffer, mimeType: string, fileName: string): Promise<ExtractionResult> {
  const lower = fileName.toLowerCase();
  try {
    if (mimeType.includes('pdf') || lower.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return { text: result.text?.trim() || null, status: 'done', error: null };
    }
    if (mimeType.includes('wordprocessingml') || lower.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value?.trim() || null, status: 'done', error: null };
    }
    if (mimeType.startsWith('text/') || lower.endsWith('.txt') || lower.endsWith('.md')) {
      return { text: buffer.toString('utf8').trim() || null, status: 'done', error: null };
    }
    return { text: null, status: 'unsupported', error: 'Tipo de arquivo ainda nao suportado para leitura pela IA (aceitos: PDF, DOCX, TXT, MD). O arquivo foi salvo, mas nao sera consultado pela IA.' };
  } catch (error) {
    return { text: null, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido na extracao de texto.' };
  }
}

export async function saveKnowledgeFile(params: {
  userId: string;
  projectId?: string | null;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const admin = createSupabaseAdminClient();
  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${params.userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, params.buffer, {
    contentType: params.mimeType || 'application/octet-stream',
    upsert: false
  });
  if (uploadError) throw new Error(`Falha ao enviar arquivo para o storage: ${uploadError.message}`);

  const extraction = await extractText(params.buffer, params.mimeType, params.fileName);

  const { data, error } = await admin
    .schema('core')
    .from('knowledge_files')
    .insert({
      user_id: params.userId,
      project_id: params.projectId ?? null,
      file_name: params.fileName,
      mime_type: params.mimeType,
      size_bytes: params.buffer.length,
      storage_path: storagePath,
      extracted_text: extraction.text,
      extraction_status: extraction.status,
      extraction_error: extraction.error
    })
    .select('id, file_name, mime_type, size_bytes, created_at, extraction_status, extraction_error')
    .single();

  if (error) {
    // Falha ao salvar metadados: remove o arquivo ja enviado, para nao
    // deixar lixo orfao no bucket sem registro correspondente.
    await admin.storage.from(BUCKET).remove([storagePath]).catch(() => undefined);
    throw new Error(`Falha ao salvar metadados do arquivo: ${error.message}`);
  }

  return data as {
    id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    created_at: string;
    extraction_status: string;
    extraction_error: string | null;
  };
}

export async function listKnowledgeFiles(userId: string): Promise<KnowledgeFile[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('core')
    .from('knowledge_files')
    .select('id, file_name, mime_type, size_bytes, created_at, extraction_status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    extractionStatus: row.extraction_status
  }));
}

export async function deleteKnowledgeFile(userId: string, id: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .schema('core')
    .from('knowledge_files')
    .select('storage_path')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (row?.storage_path) {
    await admin.storage.from(BUCKET).remove([row.storage_path]).catch(() => undefined);
  }

  await admin.schema('core').from('knowledge_files').delete().eq('id', id).eq('user_id', userId);
}

/**
 * Busca simples por palavra-chave (v1) nos arquivos de conhecimento do
 * usuario. Nao usa busca vetorial/embeddings ainda -- para o volume
 * pessoal esperado (dezenas de arquivos, nao milhares), contagem de
 * palavras em comum e suficiente. Registrado como limitacao conhecida
 * para uma evolucao futura (ver patch).
 */
export async function getKnowledgeContext(userId: string, query: string, limit = 3): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('core')
    .from('knowledge_files')
    .select('file_name, extracted_text')
    .eq('user_id', userId)
    .eq('extraction_status', 'done')
    .not('extracted_text', 'is', null);

  if (error || !data || data.length === 0) return null;

  const queryWords = query.toLowerCase().split(/\s+/).filter((word) => word.length > 3);

  const scored = data
    .map((row: any) => {
      const text = String(row.extracted_text ?? '');
      const lowerText = text.toLowerCase();
      const score = queryWords.reduce((acc, word) => acc + (lowerText.includes(word) ? 1 : 0), 0);
      return { fileName: row.file_name as string, text, score };
    })
    .filter((item) => item.text);

  const relevant = queryWords.length > 0
    ? scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score)
    : scored;

  const top = relevant.slice(0, limit);
  if (top.length === 0) return null;

  const blocks = top.map((item) => `--- ${item.fileName} ---\n${item.text.slice(0, 3000)}`);
  return `BASE DE CONHECIMENTO DO USUARIO (arquivos enviados por ele para consulta):\n\n${blocks.join('\n\n')}\n\nUse essas informacoes quando forem relevantes para a solicitacao atual. Nao invente informacoes que nao estejam nesses arquivos.`;
}
