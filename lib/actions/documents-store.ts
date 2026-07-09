import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'documents';

export type StoredDocument = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  persona: string | null;
  format: string | null;
  source: string | null;
};

export async function storeGeneratedDocument(params: {
  userId: string;
  projectId?: string | null;
  actionRunId?: string | null;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  persona?: string | null;
  format?: string | null;
  source?: string | null;
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const admin = createSupabaseAdminClient();
    const buffer = Buffer.from(params.contentBase64, 'base64');
    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${params.userId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: params.mimeType,
      upsert: false
    });
    if (uploadError) return { id: null, error: uploadError.message };

    const { data, error } = await admin
      .schema('core')
      .from('action_artifacts')
      .insert({
        action_run_id: params.actionRunId ?? null,
        user_id: params.userId,
        project_id: params.projectId ?? null,
        file_name: params.fileName,
        mime_type: params.mimeType,
        size_bytes: buffer.length,
        storage_path: storagePath,
        metadata: { persona: params.persona ?? null, format: params.format ?? null, source: params.source ?? 'actions' }
      })
      .select('id')
      .single();

    if (error) {
      await admin.storage.from(BUCKET).remove([storagePath]).catch(() => undefined);
      return { id: null, error: error.message };
    }

    return { id: data?.id ?? null, error: null };
  } catch (error) {
    return { id: null, error: error instanceof Error ? error.message : 'Erro desconhecido ao guardar documento.' };
  }
}

export async function listGeneratedDocuments(userId: string): Promise<StoredDocument[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('core')
    .from('action_artifacts')
    .select('id, file_name, mime_type, size_bytes, created_at, metadata')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    persona: row.metadata?.persona ?? null,
    format: row.metadata?.format ?? null,
    source: row.metadata?.source ?? null
  }));
}

export async function getDocumentDownloadUrl(userId: string, artifactId: string): Promise<{ url: string | null; fileName: string | null; error: string | null }> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('core')
    .from('action_artifacts')
    .select('storage_path, file_name')
    .eq('id', artifactId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { url: null, fileName: null, error: error.message };
  if (!data?.storage_path) return { url: null, fileName: null, error: 'Arquivo nao encontrado ou sem conteudo salvo.' };

  const { data: signed, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(data.storage_path, 60 * 5);
  if (signError || !signed?.signedUrl) return { url: null, fileName: null, error: signError?.message ?? 'Falha ao gerar link de download.' };

  return { url: signed.signedUrl, fileName: data.file_name, error: null };
}
