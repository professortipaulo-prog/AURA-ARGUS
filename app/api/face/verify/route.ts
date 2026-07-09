import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { verifyFaceDescriptor, logFaceVerification } from '@/lib/face/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.descriptor) {
    return NextResponse.json({ ok: false, error: 'Descritor facial ausente na requisicao.' }, { status: 400 });
  }

  const result = await verifyFaceDescriptor(session.userId, body.descriptor);

  if (!result.enrolled) {
    // Usuario nao tem cadastro facial -- nao ha o que verificar, nunca bloqueia.
    return NextResponse.json({ ok: true, matched: true, enrolled: false });
  }

  await logFaceVerification({ userId: session.userId, matched: result.matched, distance: result.distance });

  return NextResponse.json({ ok: true, matched: result.matched, enrolled: true });
}
