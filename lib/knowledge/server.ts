import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from './embeddings';

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
      const { extractText: extractPdfText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractPdfText(pdf, { mergePages: true });
      return { text: text?.trim() || null, status: 'done', error: null };
    }
    if (mimeType.includes('wordprocessingml') || lower.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default;
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
  const embedding = extraction.text ? await generateEmbedding(extraction.text) : null;

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
      extraction_error: extraction.error,
      embedding
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
 * Busca de contexto na base de conhecimento do usuario, em 2 camadas:
 * 1) Busca semantica (por significado, via embeddings) -- prioritaria,
 *    cobre arquivos enviados apos o PATCH_111.
 * 2) Busca por palavra-chave (v1, PATCH_086) -- usada apenas para
 *    arquivos mais antigos que ainda nao tem embedding gerado, para nao
 *    perder acesso a conteudo ja enviado antes desta melhoria.
 */
export async function getKnowledgeContext(userId: string, query: string, limit = 3): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const blocks: string[] = [];
  const usedFileNames = new Set<string>();

  // Camada 1: busca semantica.
  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding) {
    const { data: semanticMatches } = await admin.schema('core').rpc('match_knowledge_files', {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_count: limit
    });

    for (const row of semanticMatches ?? []) {
      const text = String(row.extracted_text ?? '');
      if (!text || usedFileNames.has(row.file_name)) continue;
      blocks.push(`--- ${row.file_name} (relevância semântica: ${(row.similarity * 100).toFixed(0)}%) ---\n${text.slice(0, 20000)}`);
      usedFileNames.add(row.file_name);
    }
  }

  // Camada 2: palavra-chave, so para arquivos SEM embedding (mais antigos)
  // e so se ainda houver espaco dentro do limite.
  if (blocks.length < limit) {
    const { data, error } = await admin
      .schema('core')
      .from('knowledge_files')
      .select('file_name, extracted_text')
      .eq('user_id', userId)
      .eq('extraction_status', 'done')
      .is('embedding', null)
      .not('extracted_text', 'is', null);

    if (!error && data) {
      const queryWords = query.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
      const scored = data
        .map((row: any) => {
          const text = String(row.extracted_text ?? '');
          const lowerText = text.toLowerCase();
          const score = queryWords.reduce((acc, word) => acc + (lowerText.includes(word) ? 1 : 0), 0);
          return { fileName: row.file_name as string, text, score };
        })
        .filter((item) => item.text && !usedFileNames.has(item.fileName));

      const relevant = queryWords.length > 0
        ? scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score)
        : scored;

      for (const item of relevant.slice(0, limit - blocks.length)) {
        blocks.push(`--- ${item.fileName} ---\n${item.text.slice(0, 20000)}`);
      }
    }
  }

  if (blocks.length === 0) return null;

  return `BASE DE CONHECIMENTO DO USUARIO (arquivos enviados por ele para consulta):\n\n${blocks.join('\n\n')}\n\nIMPORTANTE: estes arquivos sao a fonte PRIORITARIA sobre o usuario e seus assuntos -- sempre verifique e use essas informacoes primeiro quando forem relevantes para a solicitacao atual, antes de recorrer a conhecimento geral ou busca na web. Nao invente informacoes que nao estejam nesses arquivos. Quando complementar com informacao da internet (busca na web), sempre inclua a fonte/referencia (nome do site ou link) junto da informacao, para que o usuario saiba de onde veio.`;
}

export async function reindexKnowledgeEmbeddings(userId: string): Promise<{ reindexed: number; failed: number }> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('core')
    .from('knowledge_files')
    .select('id, extracted_text')
    .eq('user_id', userId)
    .eq('extraction_status', 'done')
    .is('embedding', null)
    .not('extracted_text', 'is', null);

  let reindexed = 0;
  let failed = 0;

  for (const row of data ?? []) {
    const embedding = await generateEmbedding(String(row.extracted_text));
    if (!embedding) {
      failed += 1;
      continue;
    }
    const { error } = await admin.schema('core').from('knowledge_files').update({ embedding }).eq('id', row.id);
    if (error) failed += 1;
    else reindexed += 1;
  }

  return { reindexed, failed };
}
