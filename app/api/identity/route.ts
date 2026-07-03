import { NextResponse } from 'next/server';
import { getCurrentUserIdentity } from '@/lib/identity/server';

export async function GET() {
  const { identity, error } = await getCurrentUserIdentity();

  if (!identity) {
    return NextResponse.json({ ok: false, error: error ?? 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, identity, warning: error });
}
