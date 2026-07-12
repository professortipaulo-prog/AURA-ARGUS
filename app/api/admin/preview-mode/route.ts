import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, isAdmin } from '@/lib/auth/session';
import { PREVIEW_COOKIE } from '@/lib/admin/preview-mode';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ ok: false, error: 'Só o dono/admin pode usar o modo de visualização.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type === 'estudantil' || body?.type === 'worker' ? body.type : null;

  const store = cookies();
  if (type) {
    store.set(PREVIEW_COOKIE, type, { path: '/', maxAge: 60 * 60 * 12 }); // 12h, só pra sessão de teste do dia
  } else {
    store.delete(PREVIEW_COOKIE);
  }

  return NextResponse.json({ ok: true, type });
}
