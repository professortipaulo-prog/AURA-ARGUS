import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { buildIdentityEngine } from './identity-engine';
import type { IdentityProfile } from './types';

type StoredIdentityRow = {
  profile_data?: unknown;
  user_context?: unknown;
  completion_percent?: number;
  updated_at?: string;
};

function normalizeProfileData(row: StoredIdentityRow | null | undefined) {
  if (!row) return null;
  if (row.profile_data && typeof row.profile_data === 'object') return row.profile_data as Record<string, unknown>;
  if (row.user_context && typeof row.user_context === 'object') return row.user_context as Record<string, unknown>;
  return null;
}

export async function getCurrentUserIdentity(): Promise<{
  user: { id: string; email?: string | null } | null;
  identity: IdentityProfile | null;
  error: string | null;
}> {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.id || !user.email) {
    return { user: null, identity: null, error: 'Não autenticado.' };
  }

  const { data, error } = await supabase.rpc('get_user_profile_intelligence', { p_user_id: user.id });

  if (error) {
    return {
      user,
      identity: buildIdentityEngine(user.email, null, user.id),
      error: error.message
    };
  }

  const row = (Array.isArray(data) ? data[0] : data) as StoredIdentityRow | null;
  const identity = buildIdentityEngine(user.email, normalizeProfileData(row), user.id);
  identity.updatedAt = row?.updated_at;

  return { user, identity, error: null };
}

export async function getIdentityForUserId(userId: string, email: string): Promise<{ identity: IdentityProfile | null; error: string | null }> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc('get_user_profile_intelligence', { p_user_id: userId });

  if (error) {
    return { identity: buildIdentityEngine(email, null, userId), error: error.message };
  }

  const row = (Array.isArray(data) ? data[0] : data) as StoredIdentityRow | null;
  const identity = buildIdentityEngine(email, normalizeProfileData(row), userId);
  identity.updatedAt = row?.updated_at;

  return { identity, error: null };
}

export async function upsertIdentitySnapshot(userId: string, identity: IdentityProfile) {
  const supabase = createSupabaseServerClient().schema('core');
  const now = new Date().toISOString();

  const payload = {
    user_id: userId,
    identity_summary: identity.summary,
    professional_archetype: identity.inferences.professionalArchetype,
    communication_pattern: identity.inferences.communicationPattern,
    decision_style: identity.inferences.decisionStyle,
    autonomy_level: identity.inferences.autonomyLevel,
    delivery_preference: identity.inferences.deliveryPreference,
    risk_attention: identity.inferences.riskAttention,
    learned_preferences: identity.learnedPreferences,
    signals: identity.signals,
    gaps: identity.gaps,
    aura_instruction: identity.auraInstruction,
    argus_instruction: identity.argusInstruction,
    system_prompt: identity.systemPrompt,
    completion_percent: identity.completion,
    updated_at: now
  };

  const { error } = await supabase.from('identity_profiles').upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
  return payload;
}

export async function getStoredIdentitySnapshot(userId: string) {
  const supabase = createSupabaseServerClient().schema('core');
  const { data, error } = await supabase
    .from('identity_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
