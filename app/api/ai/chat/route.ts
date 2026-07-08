import { NextResponse } from 'next/server';
import { sendChat } from '@/lib/ai/ai-router';
import { getCurrentUserIdentity } from '@/lib/identity/server';
import { buildMemoryPrompt, getMemoryContext, getOrCreateActiveProject, saveChatTurn } from '@/lib/memory/server';
import { buildPersonaSystemPrompt } from '@/lib/identity/prompt-builder';
import { getKnowledgeContext } from '@/lib/knowledge/server';
import { ProviderNotConfiguredError, type AIPersonaId, type AIProviderId, type ChatRequestBody } from '@/lib/ai/types';

function friendlyAIError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido ao chamar o provedor de IA.';

  if (/model|modelo|not found|404/i.test(message)) {
    return 'Não foi possível usar o modelo solicitado. O AURA/ARGUS tentou selecionar automaticamente outro modelo disponível.';
  }

  if (/api key|chave|authentication|auth|permission|401|403/i.test(message)) {
    return 'A chave do provedor de IA parece inválida, ausente ou sem permissão. Verifique as variáveis de ambiente na Vercel.';
  }

  return message;
}

function normalizePersona(value: unknown): AIPersonaId {
  return value === 'argus' ? 'argus' : 'aura';
}

export async function POST(request: Request) {
  let body: Partial<ChatRequestBody>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido no corpo da requisição.' }, { status: 400 });
  }

  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    return NextResponse.json({ ok: false, error: 'O campo "message" é obrigatório.' }, { status: 400 });
  }

  const provider = body.provider as AIProviderId | undefined;
  if (provider && provider !== 'anthropic' && provider !== 'gemini') {
    return NextResponse.json({ ok: false, error: 'Provedor inválido. Use "anthropic" ou "gemini".' }, { status: 400 });
  }

  const persona = normalizePersona(body.persona);

  try {
    const { user, identity } = await getCurrentUserIdentity();
    const requestedProjectId = typeof body.projectId === 'string' && body.projectId.trim() ? body.projectId.trim() : null;

    const emptyMemoryContext = { project: null, projectMemories: [], importantMemories: [], relevantMemories: [], recentSessions: [] };
    let activeProjectId: string | null = requestedProjectId;

    if (user?.id && !activeProjectId) {
      const activeProject = await getOrCreateActiveProject(user.id);
      activeProjectId = activeProject.projectId;
    }

    const memory = user?.id
      ? await getMemoryContext(user.id, 12, body.message, activeProjectId)
      : { context: emptyMemoryContext, error: null };

    activeProjectId = activeProjectId ?? memory.context.project?.id ?? null;
    const memoryPrompt = buildMemoryPrompt(memory.context, body.message);
    const knowledgeContext = user?.id ? await getKnowledgeContext(user.id, body.message) : null;
    const systemPrompt = buildPersonaSystemPrompt({
      persona,
      identity,
      memoryPrompt: knowledgeContext ? `${memoryPrompt}\n\n${knowledgeContext}` : memoryPrompt,
      extraSystemPrompt: body.systemPrompt
    });

    const result = await sendChat({ message: body.message, provider, model: body.model, persona, systemPrompt });

    let sessionId = body.sessionId ?? null;
    let memorySaved = false;
    let memoryRecorded = false;
    let memoryError: string | null = null;

    if (user?.id) {
      try {
        const saved = await saveChatTurn({
          userId: user.id,
          userEmail: user.email ?? null,
          sessionId,
          projectId: activeProjectId,
          persona,
          userMessage: body.message,
          assistantMessage: result.response,
          provider: result.provider,
          model: result.model
        });
        sessionId = saved.sessionId;
        memorySaved = true;
        memoryRecorded = saved.memoryRecorded;
      } catch (err) {
        memoryError = err instanceof Error ? err.message : 'Não foi possível salvar a memória da conversa.';
      }
    }

    return NextResponse.json({
      ...result,
      identityApplied: Boolean(identity),
      projectId: activeProjectId,
      project: memory.context.project,
      memoryApplied: memory.context.projectMemories.length > 0 || memory.context.importantMemories.length > 0 || memory.context.relevantMemories.length > 0 || memory.context.recentSessions.length > 0,
      memorySaved,
      memoryRecorded,
      memoryError,
      sessionId,
      persona: persona === 'argus' ? 'ARGUS' : 'AURA',
      route: result.route,
      fallbackUsed: result.fallbackUsed ?? false,
      fallbackFrom: result.fallbackFrom ?? null
    });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: friendlyAIError(error) }, { status: 500 });
  }
}
