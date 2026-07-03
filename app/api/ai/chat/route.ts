import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { sendChat } from '@/lib/ai/ai-router';
import { ProviderNotConfiguredError, type AIProviderId, type ChatRequestBody } from '@/lib/ai/types';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Acesso negado. Faça login para usar a IA.' }, { status: 401 });
  }

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
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido ao chamar o provedor de IA.' },
      { status: 500 }
    );
  }
}
