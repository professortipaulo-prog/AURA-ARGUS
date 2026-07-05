import { NextResponse } from 'next/server';
import { sendChat } from '@/lib/ai/ai-router';
import { getCurrentUserIdentity } from '@/lib/identity/server';
import { getSession } from '@/lib/auth/session';
import {
  buildTemporalContext,
  getOrCreateActiveProject,
  getProjectMemoryContext,
  memoryPromptBlock,
  persistChatTurn,
  temporalPromptBlock
} from '@/lib/memory/server';
import { ProviderNotConfiguredError, type AIPersonaId, type AIProviderId, type ChatRequestBody } from '@/lib/ai/types';

type StableChatRequestBody = Partial<ChatRequestBody> & {
  sessionId?: string | null;
  projectId?: string | null;
};

function friendlyAIError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido ao chamar o provedor de IA.';

  if (/model|modelo|not found|404/i.test(message)) {
    return 'Não foi possível usar o modelo solicitado. O AURA/ARGUS tentou selecionar automaticamente outro modelo disponível. Verifique os modelos configurados se o problema continuar.';
  }

  if (/api key|chave|authentication|auth|permission|401|403/i.test(message)) {
    return 'A chave do provedor de IA parece inválida, ausente ou sem permissão. Verifique as variáveis de ambiente na Vercel.';
  }

  return message;
}

function normalizePersona(value: unknown): AIPersonaId {
  return value === 'argus' ? 'argus' : 'aura';
}

function personaBasePrompt(persona: AIPersonaId) {
  if (persona === 'argus') {
    return [
      'Você é ARGUS, Agente de Raciocínio, Gestão, Unificação e Supervisão do sistema AURA/ARGUS.',
      'Responda sempre como ARGUS, em português do Brasil, com foco técnico, objetivo e operacional.',
      'Nunca diga que é Gemini, Google, Claude, Anthropic ou um modelo genérico. Você pode mencionar o provedor apenas se o usuário perguntar especificamente sobre a infraestrutura técnica.',
      'Use o perfil inteligente, a memória recuperada do projeto e o contexto temporal obrigatório antes de responder.',
      'Se o usuário perguntar data, hora ou prazo do dia, use exclusivamente o contexto temporal obrigatório enviado pelo sistema.'
    ].join(' ');
  }

  return [
    'Você é AURA, Assistente Universal de Raciocínio e Ação do sistema AURA/ARGUS.',
    'Responda sempre como AURA, em português do Brasil, com foco em clareza, produtividade, escrita, documentos, planejamento e apoio profissional.',
    'Nunca diga que é Claude, Anthropic, Gemini, Google ou um modelo genérico. Você pode mencionar o provedor apenas se o usuário perguntar especificamente sobre a infraestrutura técnica.',
    'Use o perfil inteligente, a memória recuperada do projeto e o contexto temporal obrigatório antes de responder.',
    'Se o usuário perguntar data, hora ou prazo do dia, use exclusivamente o contexto temporal obrigatório enviado pelo sistema.'
  ].join(' ');
}

function combinePrompts(parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join('\n\n---\n\n');
}

export async function POST(request: Request) {
  let body: StableChatRequestBody;

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
    return NextResponse.json(
      { ok: false, error: 'Provedor inválido. Use "anthropic" ou "gemini".' },
      { status: 400 }
    );
  }

  const persona = normalizePersona(body.persona);
  const startedAt = Date.now();

  try {
    const appSession = await getSession();
    const { identity } = await getCurrentUserIdentity();
    const identityPrompt = identity ? (persona === 'argus' ? identity.argusInstruction : identity.auraInstruction) : undefined;

    const activeProject = appSession?.userId
      ? await getOrCreateActiveProject(appSession.userId, appSession.organizationId)
      : { projectId: body.projectId ?? null, organizationId: null, error: null };

    const recoveredMemory = appSession?.userId
      ? await getProjectMemoryContext(appSession.userId, body.projectId || activeProject.projectId)
      : { items: [] };

    const temporalContext = buildTemporalContext();
    const systemPrompt = combinePrompts([
      personaBasePrompt(persona),
      temporalPromptBlock(temporalContext),
      memoryPromptBlock(recoveredMemory),
      identityPrompt ? `Contexto do perfil inteligente do usuário: ${identityPrompt}` : 'Perfil inteligente ainda não disponível ou incompleto.',
      body.systemPrompt
    ]);

    const result = await sendChat({ message: body.message, provider, model: body.model, systemPrompt });

    const persistence = appSession?.userId
      ? await persistChatTurn({
          userId: appSession.userId,
          organizationId: activeProject.organizationId ?? appSession.organizationId,
          projectId: body.projectId || activeProject.projectId,
          sessionId: body.sessionId ?? null,
          persona,
          provider: result.provider,
          model: result.model,
          userMessage: body.message,
          assistantMessage: result.response,
          latencyMs: Date.now() - startedAt
        })
      : null;

    return NextResponse.json({
      ...result,
      identityApplied: Boolean(identityPrompt),
      persona: persona === 'argus' ? 'ARGUS' : 'AURA',
      temporalContext,
      projectId: body.projectId || activeProject.projectId,
      memoryRecovered: recoveredMemory.items.length,
      sessionId: persistence?.sessionId ?? body.sessionId ?? null,
      persistence: persistence
        ? {
            userMessageSaved: persistence.userMessageSaved,
            assistantMessageSaved: persistence.assistantMessageSaved,
            memorySaved: persistence.memorySaved,
            error: persistence.error
          }
        : null
    });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: friendlyAIError(error) }, { status: 500 });
  }
}
