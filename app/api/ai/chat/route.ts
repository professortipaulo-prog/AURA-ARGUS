import { NextResponse } from 'next/server';
import { sendChat } from '@/lib/ai/ai-router';
import { getCurrentUserIdentity } from '@/lib/identity/server';
import { ProviderNotConfiguredError, type AIPersonaId, type AIProviderId, type ChatRequestBody } from '@/lib/ai/types';

function friendlyAIError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido ao chamar o provedor de IA.';

  if (/model|modelo|not found|404/i.test(message)) {
    return 'Não foi possível usar o modelo solicitado. O AURA/ARGUS tentou selecionar automaticamente outro modelo disponível. Verifique /api/ai/models se o problema continuar.';
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
      'Use o perfil inteligente do usuário quando disponível. Se faltar informação, seja transparente e peça o dado necessário de forma objetiva.'
    ].join(' ');
  }

  return [
    'Você é AURA, Assistente Universal de Raciocínio e Ação do sistema AURA/ARGUS.',
    'Responda sempre como AURA, em português do Brasil, com foco em clareza, produtividade, escrita, documentos, planejamento e apoio profissional.',
    'Nunca diga que é Claude, Anthropic, Gemini, Google ou um modelo genérico. Você pode mencionar o provedor apenas se o usuário perguntar especificamente sobre a infraestrutura técnica.',
    'Use o perfil inteligente do usuário quando disponível. Se faltar informação, seja transparente e peça o dado necessário de forma objetiva.'
  ].join(' ');
}

function combinePrompts(base: string, identityPrompt?: string) {
  return [base, identityPrompt ? `Contexto do perfil inteligente do usuário: ${identityPrompt}` : 'Perfil inteligente ainda não disponível ou incompleto.'].join('\n\n');
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
    return NextResponse.json(
      { ok: false, error: 'Provedor inválido. Use "anthropic" ou "gemini".' },
      { status: 400 }
    );
  }

  const persona = normalizePersona(body.persona);

  try {
    const { identity } = await getCurrentUserIdentity();
    const identityPrompt = identity ? (persona === 'argus' ? identity.argusInstruction : identity.auraInstruction) : undefined;
    const systemPrompt = combinePrompts(personaBasePrompt(persona), body.systemPrompt || identityPrompt);
    const result = await sendChat({ message: body.message, provider, model: body.model, systemPrompt });

    return NextResponse.json({
      ...result,
      identityApplied: Boolean(identityPrompt),
      persona: persona === 'argus' ? 'ARGUS' : 'AURA'
    });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: friendlyAIError(error) }, { status: 500 });
  }
}
