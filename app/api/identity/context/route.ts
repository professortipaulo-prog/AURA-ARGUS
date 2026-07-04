import { NextResponse } from 'next/server';
import { getCurrentUserIdentity, upsertIdentitySnapshot } from '@/lib/identity/server';

export async function GET() {
  const { user, identity, error } = await getCurrentUserIdentity();

  if (!user || !identity) {
    return NextResponse.json({ ok: false, error: error ?? 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, identity });
}

export async function POST() {
  const { user, identity, error } = await getCurrentUserIdentity();

  if (!user || !identity) {
    return NextResponse.json({ ok: false, error: error ?? 'Não autenticado.' }, { status: 401 });
  }

  try {
    const snapshot = await upsertIdentitySnapshot(user.id, identity);
    return NextResponse.json({ ok: true, identity, snapshot });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erro ao salvar identidade.' }, { status: 500 });
  }
}
