import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: enrollment } = await admin
    .schema('core')
    .from('face_enrollments')
    .select('created_at, updated_at')
    .eq('user_id', session.userId)
    .maybeSingle();

  const { data: logs, error } = await admin
    .schema('core')
    .from('face_verification_log')
    .select('matched, distance, identification_note, created_at')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    enrollment: enrollment ?? null,
    // Limiar oficial usado para considerar "mesma pessoa": distancia <= 0.6
    threshold: 0.6,
    recentAttempts: logs ?? []
  });
}
