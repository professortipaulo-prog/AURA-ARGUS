import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { logFaceVerification } from '@/lib/face/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const note = typeof body?.note === 'string' ? body.note.slice(0, 500) : null;

  await logFaceVerification({ userId: session.userId, matched: false, distance: null, identificationNote: note });

  return NextResponse.json({ ok: true });
}
