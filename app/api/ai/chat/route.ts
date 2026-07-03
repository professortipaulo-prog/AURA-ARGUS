import { NextResponse } from 'next/server';
import { sendChat } from '@/lib/ai/ai-router';
import { ProviderNotConfiguredError, type AIProviderId, type ChatRequestBody } from '@/lib/ai/types';

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

  try {
    const result = await sendChat({ message: body.message, provider, model: body.model });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: friendlyAIError(error) }, { status: 500 });
  }
}
