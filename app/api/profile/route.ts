import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildUserContext, calculateProfileCompletion, emptyProfile } from '@/lib/profile/context';
import type { ProfileEngineData, ProfileEngineRow } from '@/lib/profile/types';

function isSchemaExposureError(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('invalid schema') || normalized.includes('schema must be one of');
}

function mergeProfile(input: Partial<ProfileEngineData> | null | undefined): ProfileEngineData {
  return {
    personal: { ...emptyProfile.personal, ...(input?.personal ?? {}) },
    professional: { ...emptyProfile.professional, ...(input?.professional ?? {}) },
    behavioral: { ...emptyProfile.behavioral, ...(input?.behavioral ?? {}) },
    goals: { ...emptyProfile.goals, ...(input?.goals ?? {}) },
    routine: { ...emptyProfile.routine, ...(input?.routine ?? {}) },
    tools: { ...emptyProfile.tools, ...(input?.tools ?? {}) },
    skills: { ...emptyProfile.skills, ...(input?.skills ?? {}) },
    aiPreferences: { ...emptyProfile.aiPreferences, ...(input?.aiPreferences ?? {}) }
  };
}

function rowToProfile(row: ProfileEngineRow | null): ProfileEngineData {
  if (!row) return emptyProfile;
  return mergeProfile({
    personal: row.personal ?? {},
    professional: row.professional ?? {},
    behavioral: row.behavioral ?? {},
    goals: row.goals ?? {},
    routine: row.routine ?? {},
    tools: row.tools ?? {},
    skills: row.skills ?? {},
    aiPreferences: row.ai_preferences ?? {}
  });
}

async function getAuthenticatedUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id || !user.email) return null;
  return user;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Usuario nao autenticado.' }, { status: 401 });
  const email = user.email ?? '';

  try {
    const admin = createSupabaseAdminClient();
    const core = admin.schema('core');

    const { data: profile, error: profileError } = await core
      .from('profiles')
      .select('full_name, display_name, email, professional_title, company, preferences')
      .eq('id', user.id)
      .maybeSingle();

    const { data: intelligenceRow, error: intelligenceError } = await core
      .from('user_profile_intelligence')
      .select('personal, professional, behavioral, goals, routine, tools, skills, ai_preferences, user_context, completion_percent')
      .eq('user_id', user.id)
      .maybeSingle();

    if (intelligenceError) {
      if (isSchemaExposureError(intelligenceError.message) || /does not exist/i.test(intelligenceError.message)) {
        const fallback = mergeProfile({
          personal: {
            fullName: profile?.full_name ?? user.user_metadata?.full_name ?? '',
            preferredName: profile?.display_name ?? profile?.full_name ?? ''
          },
          professional: {
            title: profile?.professional_title ?? '',
            company: profile?.company ?? ''
          }
        });
        return NextResponse.json({
          ok: true,
          data: fallback,
          completionPercent: calculateProfileCompletion(fallback),
          userContext: buildUserContext(fallback, email),
          warning: 'Tabela core.user_profile_intelligence ainda nao aplicada. Rode a migration 0002_profile_engine.sql.'
        });
      }
      return NextResponse.json({ ok: false, error: intelligenceError.message }, { status: 500 });
    }

    if (profileError && !isSchemaExposureError(profileError.message)) {
      return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
    }

    const data = rowToProfile(intelligenceRow as ProfileEngineRow | null);
    return NextResponse.json({
      ok: true,
      data,
      completionPercent: intelligenceRow?.completion_percent ?? calculateProfileCompletion(data),
      userContext: intelligenceRow?.user_context ?? buildUserContext(data, email)
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro ao carregar perfil.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Usuario nao autenticado.' }, { status: 401 });
  const email = user.email ?? '';

  let payload: Partial<ProfileEngineData>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalido.' }, { status: 400 });
  }

  const data = mergeProfile(payload);
  const completionPercent = calculateProfileCompletion(data);
  const userContext = buildUserContext(data, email);

  try {
    const admin = createSupabaseAdminClient();
    const core = admin.schema('core');

    const { error: profileError } = await core
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: email.toLowerCase(),
          full_name: data.personal.fullName || user.user_metadata?.full_name || email,
          display_name: data.personal.preferredName || data.personal.fullName || email,
          professional_title: data.professional.title || null,
          company: data.professional.company || null,
          disc_profile: data.behavioral.disc ? { predominant: data.behavioral.disc } : {},
          preferences: {
            profile_engine: {
              completionPercent,
              responseStyle: data.aiPreferences.responseStyle,
              tone: data.aiPreferences.tone
            }
          },
          status: 'active',
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      return NextResponse.json({ ok: false, error: `Erro ao atualizar core.profiles: ${profileError.message}` }, { status: 500 });
    }

    const { error } = await core
      .from('user_profile_intelligence')
      .upsert(
        {
          user_id: user.id,
          personal: data.personal,
          professional: data.professional,
          behavioral: data.behavioral,
          goals: data.goals,
          routine: data.routine,
          tools: data.tools,
          skills: data.skills,
          ai_preferences: data.aiPreferences,
          user_context: userContext,
          completion_percent: completionPercent,
          completed_at: completionPercent >= 90 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      if (/does not exist/i.test(error.message) || isSchemaExposureError(error.message)) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Tabela core.user_profile_intelligence nao encontrada. Rode supabase/migrations/0002_profile_engine.sql no Supabase SQL Editor.'
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data, completionPercent, userContext });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro ao salvar perfil.' },
      { status: 500 }
    );
  }
}
