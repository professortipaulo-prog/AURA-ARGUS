import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMemoryContext } from '@/lib/memory/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const result = await getMemoryContext(user.id, 12);
  return NextResponse.json({ ok: !result.error, ...result });
}
