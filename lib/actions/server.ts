import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/session';
import { ACTION_CAPABILITIES } from './capabilities';
import { createDocumentArtifact } from './document-engine';
import type { ExecuteActionRequest, ExecuteActionResult } from './types';

function isSchemaError(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('does not exist') || normalized.includes('invalid schema') || normalized.includes('schema must be one of');
}

async function persistRun(input: {
  userId: string;
  projectId?: string | null;
  action: string;
  status: string;
  requestPayload: unknown;
  resultPayload: unknown;
}) {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.schema('core').from('action_runs').insert({
      user_id: input.userId,
      project_id: input.projectId ?? null,
      action: input.action,
      status: input.status,
      request_payload: input.requestPayload,
      result_payload: input.resultPayload
    }).select('id').single();

    if (error) {
      if (!isSchemaError(error.message)) console.warn('[AURA/ARGUS] Falha ao persistir action_run:', error.message);
      return null;
    }

    return data?.id as string | null;
  } catch (error) {
    console.warn('[AURA/ARGUS] Action Engine em modo sem persistencia:', error);
    return null;
  }
}

export async function executeAction(request: ExecuteActionRequest): Promise<ExecuteActionResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, action: request.action, status: 'failed', message: 'Sessao invalida ou expirada.' };
  }

  if (request.action === 'tool.list_capabilities') {
    const runId = await persistRun({
      userId: session.userId,
      projectId: request.projectId,
      action: request.action,
      status: 'completed',
      requestPayload: request,
      resultPayload: { capabilities: ACTION_CAPABILITIES }
    });
    return { ok: true, action: request.action, status: 'completed', runId: runId ?? undefined, message: 'Capacidades carregadas.' };
  }

  if (request.action !== 'document.create') {
    return { ok: false, action: request.action, status: 'failed', message: `Acao ainda nao suportada: ${request.action}` };
  }

  const artifact = createDocumentArtifact({
    title: request.title ?? 'Documento AURA ARGUS',
    content: request.content ?? '',
    format: request.format ?? 'md'
  });

  const runId = await persistRun({
    userId: session.userId,
    projectId: request.projectId,
    action: request.action,
    status: 'completed',
    requestPayload: { ...request, content: request.content?.slice(0, 2000) },
    resultPayload: {
      artifact: {
        fileName: artifact.fileName,
        mimeType: artifact.mimeType,
        sizeBytes: artifact.sizeBytes
      }
    }
  });

  return {
    ok: true,
    action: request.action,
    status: 'completed',
    runId: runId ?? undefined,
    artifact,
    message: `Documento preparado para download: ${artifact.fileName}`,
    warnings: request.format === 'doc'
      ? ['Formato DOC gerado como HTML compativel com Word. DOCX nativo entra na etapa avancada do Document Engine.']
      : undefined
  };
}
