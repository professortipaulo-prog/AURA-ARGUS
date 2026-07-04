import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { data, error } = await supabase
    .schema('core')
    .from('memory_sessions')
    .select('id,title,summary,status,message_count,last_persona,last_message_at,updated_at,created_at')
    .eq('user_id', user.id)
    .neq('status', 'deleted')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data ?? [] });
}
