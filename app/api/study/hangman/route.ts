import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { generateHangman } from '@/lib/study/generation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  const persona = body?.persona === 'argus' ? 'argus' : 'aura';

  if (!subject) return NextResponse.json({ ok: false, error: 'Diga o que você está estudando.' }, { status: 400 });

  try {
    const game = await generateHangman(subject, persona);
    if (!game || !game.words?.length) {
      return NextResponse.json({ ok: false, error: 'Não consegui montar o jogo agora. Tente de novo.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, game });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao gerar o jogo.' }, { status: 500 });
  }
}
