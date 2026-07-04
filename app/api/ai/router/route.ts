import { NextResponse } from 'next/server';
import { getRouterDiagnostics } from '@/lib/ai/ai-router';
import { decideAIRoute } from '@/lib/ai/router-policy';
import type { AIPersonaId, AIProviderId } from '@/lib/ai/types';

function normalizePersona(value: string | null): AIPersonaId | undefined {
  if (value === 'aura' || value === 'argus') return value;
  return undefined;
}

function normalizeProvider(value: string | null): AIProviderId | undefined {
  if (value === 'anthropic' || value === 'gemini') return value;
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');
  const persona = normalizePersona(searchParams.get('persona'));
  const provider = normalizeProvider(searchParams.get('provider'));

  const diagnostics = await getRouterDiagnostics();

  if (message && message.trim()) {
    return NextResponse.json({
      ...diagnostics,
      preview: decideAIRoute({ message, persona, provider })
    });
  }

  return NextResponse.json(diagnostics);
}
