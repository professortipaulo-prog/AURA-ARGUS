import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMemoryDebug } from '@/lib/memory/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return NextResponse.json({ ok: false, error: error?.message ?? 'Não autenticado.' }, { status: 401 });
  }

  const result = await getMemoryDebug(user.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, debug: result.data });
}
