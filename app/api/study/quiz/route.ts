import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { generateQuiz } from '@/lib/study/generation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  const persona = body?.persona === 'argus' ? 'argus' : 'aura';

  if (!subject) return NextResponse.json({ ok: false, error: 'Diga o que você está estudando.' }, { status: 400 });

  try {
    const quiz = await generateQuiz(subject, persona);
    if (!quiz || !quiz.questions?.length) {
      return NextResponse.json({ ok: false, error: 'Não consegui montar o quiz agora. Tente de novo.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, quiz });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao gerar o quiz.' }, { status: 500 });
  }
}
