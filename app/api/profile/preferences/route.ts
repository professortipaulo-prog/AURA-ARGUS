import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data } = await admin.schema('core').from('profiles').select('preferences').eq('id', session.userId).maybeSingle();

  return NextResponse.json({ ok: true, musicUrl: (data?.preferences as any)?.musicUrl ?? null });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const musicUrl = typeof body?.musicUrl === 'string' ? body.musicUrl.trim() : '';

  if (musicUrl && !/^https:\/\//i.test(musicUrl)) {
    return NextResponse.json({ ok: false, error: 'O link precisa começar com https://' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: current } = await admin.schema('core').from('profiles').select('preferences').eq('id', session.userId).maybeSingle();
  const preferences = { ...(current?.preferences as object ?? {}), musicUrl: musicUrl || null };

  // upsert (nao update): se a linha do perfil ainda nao existir por
  // qualquer motivo, update() nao daria erro nenhum mas tambem nao
  // salvaria nada (silenciosamente) -- upsert garante que a preferencia
  // e salva de qualquer forma, criando a linha se precisar.
  const { error } = await admin
    .schema('core')
    .from('profiles')
    .upsert({ id: session.userId, email: session.email, preferences }, { onConflict: 'id' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
