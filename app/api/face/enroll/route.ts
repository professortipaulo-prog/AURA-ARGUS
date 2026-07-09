import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { saveFaceDescriptor, getFaceEnrollmentStatus, deleteFaceEnrollment } from '@/lib/face/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const status = await getFaceEnrollmentStatus(session.userId);
  return NextResponse.json({ ok: true, ...status });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.descriptor) {
    return NextResponse.json({ ok: false, error: 'Descritor facial ausente na requisicao.' }, { status: 400 });
  }

  const result = await saveFaceDescriptor(session.userId, body.descriptor);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const result = await deleteFaceEnrollment(session.userId);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
