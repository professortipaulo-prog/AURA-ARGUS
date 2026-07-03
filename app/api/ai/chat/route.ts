import { NextResponse } from 'next/server';
import { sendChat } from '@/lib/ai/ai-router';
import { ProviderNotConfiguredError, type AIProviderId, type ChatRequestBody } from '@/lib/ai/types';

function cleanProviderError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  if (/model|not found|404|not supported/i.test(raw)) {
    return 'Modelo de IA indisponível para este provedor. O AURA/ARGUS tentou atualizar a seleção automaticamente, mas não encontrou um modelo compatível. Verifique /api/ai/models.';
  }

  if (/api[_ -]?key|unauthorized|permission|auth/i.test(raw)) {
    return 'Chave de API inválida, ausente ou sem permissão para este provedor.';
  }

  return raw || 'Erro desconhecido ao chamar o provedor de IA.';
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

  try {
    const result = await sendChat({ message: body.message, provider, model: body.model });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }

    return NextResponse.json({ ok: false, error: cleanProviderError(error) }, { status: 500 });
  }
}
