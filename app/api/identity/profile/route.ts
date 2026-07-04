import { NextResponse } from 'next/server';
import { getCurrentUserIdentity, getStoredIdentitySnapshot, upsertIdentitySnapshot } from '@/lib/identity/server';

export async function GET() {
  const { user, identity, error } = await getCurrentUserIdentity();

  if (!user || !identity) {
    return NextResponse.json({ ok: false, error: error ?? 'Não autenticado.' }, { status: 401 });
  }

  const stored = await getStoredIdentitySnapshot(user.id);
  return NextResponse.json({ ok: true, identity, stored: stored.data, storedError: stored.error });
}

export async function PUT() {
  const { user, identity, error } = await getCurrentUserIdentity();

  if (!user || !identity) {
    return NextResponse.json({ ok: false, error: error ?? 'Não autenticado.' }, { status: 401 });
  }

  try {
    const snapshot = await upsertIdentitySnapshot(user.id, identity);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erro ao atualizar perfil de identidade.' }, { status: 500 });
  }
}
