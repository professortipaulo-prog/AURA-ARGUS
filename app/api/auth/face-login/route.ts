import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { findUserIdByEmail, verifyFaceDescriptor, logFaceVerification } from '@/lib/face/server';

export const dynamic = 'force-dynamic';

// Mensagem de erro sempre igual, independente do motivo real (e-mail nao
// existe, sem cadastro facial, ou rosto nao bate) -- evita que alguem
// descubra por tentativa e erro quais e-mails tem conta no sistema.
const GENERIC_ERROR = 'Não foi possível entrar com reconhecimento facial. Use e-mail e senha.';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const descriptor = Array.isArray(body?.descriptor) ? body.descriptor : null;

  if (!email || !descriptor) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const userId = await findUserIdByEmail(email);
  if (!userId) {
    // Nao revela se o e-mail existe ou nao -- mesma mensagem de sempre.
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
  }

  const result = await verifyFaceDescriptor(userId, descriptor);
  await logFaceVerification({ userId, matched: result.matched, distance: result.distance });

  if (!result.enrolled || !result.matched) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
    }

    // Usa o cliente com acesso a cookies (nao o admin) para que a sessao
    // criada aqui seja de fato gravada nos cookies da resposta -- e assim
    // o usuario fica logado de verdade, igual ao login por senha.
    const serverClient = createSupabaseServerClient();
    const { error: verifyError } = await serverClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink'
    });

    if (verifyError) {
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }
}
