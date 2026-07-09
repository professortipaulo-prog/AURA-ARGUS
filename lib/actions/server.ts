import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/session';
import { ACTION_CAPABILITIES } from './capabilities';
import { createDocumentArtifact } from './document-engine';
import type { ExecuteActionRequest, ExecuteActionResult } from './types';
import { sendChat } from '@/lib/ai/ai-router';
import { getCurrentUserIdentity } from '@/lib/identity/server';
import { buildMemoryPrompt, getMemoryContext } from '@/lib/memory/server';
import { buildPersonaSystemPrompt } from '@/lib/identity/prompt-builder';
import { getKnowledgeContext } from '@/lib/knowledge/server';
import { storeGeneratedDocument } from './documents-store';

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

  if (request.action === 'link.prepare') {
    const target = request.linkTarget ?? 'url';
    let url: string;
    let label: string;
    const requiresConfirmation = target === 'whatsapp';

    if (target === 'whatsapp') {
      const digits = (request.phone ?? '').replace(/\D/g, '');
      if (!digits) {
        return { ok: false, action: request.action, status: 'failed', message: 'Numero de WhatsApp obrigatorio (com DDI+DDD) para preparar este link.' };
      }
      const text = request.message ? `?text=${encodeURIComponent(request.message)}` : '';
      url = `https://wa.me/${digits}${text}`;
      label = 'Abrir WhatsApp Web com a mensagem preparada';
    } else {
      const rawUrl = request.url ?? '';
      try {
        url = new URL(rawUrl).toString();
      } catch {
        return { ok: false, action: request.action, status: 'failed', message: 'URL invalida. Informe uma URL completa, ex: https://exemplo.com' };
      }
      label = 'Abrir link em nova aba';
    }

    const runId = await persistRun({
      userId: session.userId,
      projectId: request.projectId,
      action: request.action,
      status: 'completed',
      requestPayload: { ...request, message: request.message?.slice(0, 500) },
      resultPayload: { link: { url, label, requiresConfirmation } }
    });

    return {
      ok: true,
      action: request.action,
      status: 'completed',
      runId: runId ?? undefined,
      link: { url, label, requiresConfirmation },
      message: label
    };
  }

  if (request.action !== 'document.create') {
    return { ok: false, action: request.action, status: 'failed', message: `Acao ainda nao suportada: ${request.action}` };
  }

  const requestedContent = request.content?.trim() ?? '';
  const shouldUseAI = request.useAI !== false && requestedContent.length > 0;
  let finalContent = requestedContent;
  let aiElaborationError: string | null = null;
  let aiElaborationUsed = false;

  if (shouldUseAI) {
    try {
      const persona = request.persona === 'argus' ? 'argus' : 'aura';
      const { user, identity } = await getCurrentUserIdentity();
      const memory = user?.id
        ? await getMemoryContext(user.id, 12, requestedContent, request.projectId ?? null)
        : { context: { project: null, projectMemories: [], importantMemories: [], relevantMemories: [], recentSessions: [] } };
      const memoryPrompt = buildMemoryPrompt(memory.context, requestedContent);
      const knowledgeContext = user?.id ? await getKnowledgeContext(user.id, requestedContent) : null;
      const systemPrompt = buildPersonaSystemPrompt({
        persona,
        identity,
        memoryPrompt: knowledgeContext ? `${memoryPrompt}\n\n${knowledgeContext}` : memoryPrompt
      });

      const brief = `Elabore o CONTEUDO COMPLETO de um documento no formato "${request.format ?? 'md'}", com o titulo "${request.title ?? 'Documento AURA ARGUS'}".\n\nSolicitacao do usuario: "${requestedContent}"\n\nDesenvolva um texto completo, bem estruturado, em portugues do Brasil.\n\nORDEM DE PRIORIDADE DAS FONTES:\n1. Primeiro, verifique e use os arquivos da base de conhecimento do usuario (se houver algum relevante) e a memoria/perfil dele -- essa e a fonte mais confiavel sobre o proprio usuario e seus assuntos.\n2. Se o assunto exigir informacao factual, tecnica ou atual que voce nao tenha certeza -- e que nao esteja coberta pela memoria ou pela base de conhecimento -- use a ferramenta de busca na web disponivel para pesquisar antes de escrever, em vez de responder de forma generica, incompleta ou inventada.\n3. Quando usar informacao encontrada na web, inclua uma secao final "Referencias" ou "Fontes" no documento, listando o nome do site/fonte (e o link, se disponivel) de cada informacao factual usada -- para que o usuario saiba de onde veio e possa conferir.\n\nResponda APENAS com o conteudo final do documento — sem saudacoes, sem comentarios sobre a tarefa, sem introducoes tipo "aqui esta o documento".`;

      const result = await sendChat({ message: brief, persona, systemPrompt });
      if (result.response?.trim()) {
        finalContent = result.response.trim();
        aiElaborationUsed = true;
      }
    } catch (error) {
      aiElaborationError = error instanceof Error ? error.message : 'Nao foi possivel usar a IA para elaborar o conteudo.';
      // Falha na IA nao deve impedir a geracao do documento — segue com o
      // texto literal que o usuario digitou.
    }
  }

  const artifact = await createDocumentArtifact({
    title: request.title ?? 'Documento AURA ARGUS',
    content: finalContent,
    format: request.format ?? 'md',
    persona: request.persona,
    borderVariant: request.borderVariant
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

  const stored = await storeGeneratedDocument({
    userId: session.userId,
    projectId: request.projectId,
    actionRunId: runId,
    fileName: artifact.fileName,
    mimeType: artifact.mimeType,
    contentBase64: artifact.contentBase64,
    persona: request.persona ?? null,
    format: request.format ?? 'md',
    source: request.source ?? 'actions'
  });

  const warnings: string[] = [];
  if (request.format === 'doc') warnings.push('Formato DOC gerado como HTML compativel com Word. DOCX nativo entra na etapa avancada do Document Engine.');
  if (aiElaborationError) warnings.push(`Nao foi possivel usar a IA para elaborar o conteudo (${aiElaborationError}). Foi usado o texto literal informado.`);
  if (stored.error) warnings.push(`Documento gerado, mas nao foi possivel guardar no historico (${stored.error}). O download abaixo ainda funciona nesta sessao.`);

  return {
    ok: true,
    action: request.action,
    status: 'completed',
    runId: runId ?? undefined,
    artifact,
    artifactId: stored.id ?? undefined,
    message: aiElaborationUsed
      ? `Documento elaborado pela IA e preparado para download: ${artifact.fileName}`
      : `Documento preparado para download: ${artifact.fileName}`,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
