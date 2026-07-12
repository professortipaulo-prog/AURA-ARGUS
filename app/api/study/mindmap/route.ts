import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { generateMindMap } from '@/lib/study/generation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  const persona = body?.persona === 'argus' ? 'argus' : 'aura';

  if (!subject) return NextResponse.json({ ok: false, error: 'Diga sobre qual assunto você quer o mapa mental.' }, { status: 400 });

  try {
    const mindmap = await generateMindMap(subject, persona);
    if (!mindmap) {
      return NextResponse.json({ ok: false, error: 'Não consegui montar o mapa mental agora. Tente de novo.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, mindmap });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao gerar o mapa mental.' }, { status: 500 });
  }
}
