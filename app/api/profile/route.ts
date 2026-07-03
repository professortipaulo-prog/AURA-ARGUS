import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildUserContext, calculateCompletion, mergeProfile } from '@/lib/profile/context';
import type { ProfileData } from '@/lib/profile/types';

function isMissingMigration(message?: string): boolean {
  const text = (message ?? '').toLowerCase();
  return text.includes('function public.upsert_user_profile_intelligence') || text.includes('could not find the function') || text.includes('does not exist');
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.id || !user.email) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { data, error } = await supabase.rpc('get_user_profile_intelligence', { p_user_id: user.id });
  if (error) {
    if (isMissingMigration(error.message)) {
      return NextResponse.json({ profile: mergeProfile(null), context: buildUserContext(user.email, mergeProfile(null)), completion: 0, migrationRequired: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const raw = Array.isArray(data) ? data[0] : data;
  const profile = mergeProfile(raw?.profile_data as Partial<ProfileData> | null);
  const context = raw?.user_context ?? buildUserContext(user.email, profile);
  const completion = raw?.completion_percent ?? calculateCompletion(profile);

  return NextResponse.json({ profile, context, completion, migrationRequired: false });
}

export async function PUT(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.id || !user.email) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const profile = mergeProfile(body.profile as Partial<ProfileData> | null);
  const context = buildUserContext(user.email, profile);
  const completion = calculateCompletion(profile);

  const { error } = await supabase.rpc('upsert_user_profile_intelligence', {
    p_user_id: user.id,
    p_email: user.email,
    p_profile: profile,
    p_context: context,
    p_completion: completion
  });

  if (error) {
    if (isMissingMigration(error.message)) {
      return NextResponse.json({ error: 'Migração 0003_profile_engine_rpc.sql ainda não aplicada no Supabase.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile, context, completion });
}
