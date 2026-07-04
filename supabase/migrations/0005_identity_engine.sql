-- PATCH 040 / EPIC 003 - Identity Engine
-- Execute este script depois do PATCH 039.

create extension if not exists pgcrypto;
create schema if not exists core;

create table if not exists core.identity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references core.profiles(id) on delete cascade unique,
  identity_summary text not null default '',
  professional_archetype text not null default '',
  communication_pattern text not null default '',
  decision_style text not null default '',
  autonomy_level text not null default '',
  delivery_preference text not null default '',
  risk_attention text not null default '',
  learned_preferences text[] not null default array[]::text[],
  signals jsonb not null default '[]'::jsonb,
  gaps text[] not null default array[]::text[],
  aura_instruction text not null default '',
  argus_instruction text not null default '',
  system_prompt text not null default '',
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_identity_profiles_user on core.identity_profiles(user_id);
create index if not exists idx_identity_profiles_updated on core.identity_profiles(updated_at desc);

alter table core.identity_profiles enable row level security;

drop policy if exists "identity_profiles_own" on core.identity_profiles;
create policy "identity_profiles_own"
on core.identity_profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.get_identity_snapshot(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  result jsonb;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao perfil de identidade.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', ip.id,
    'userId', ip.user_id,
    'identitySummary', ip.identity_summary,
    'professionalArchetype', ip.professional_archetype,
    'communicationPattern', ip.communication_pattern,
    'decisionStyle', ip.decision_style,
    'autonomyLevel', ip.autonomy_level,
    'deliveryPreference', ip.delivery_preference,
    'riskAttention', ip.risk_attention,
    'learnedPreferences', ip.learned_preferences,
    'signals', ip.signals,
    'gaps', ip.gaps,
    'auraInstruction', ip.aura_instruction,
    'argusInstruction', ip.argus_instruction,
    'systemPrompt', ip.system_prompt,
    'completionPercent', ip.completion_percent,
    'updatedAt', ip.updated_at
  )
  into result
  from core.identity_profiles ip
  where ip.user_id = p_user_id;

  return coalesce(result, '{}'::jsonb);
end;
$$;

grant execute on function public.get_identity_snapshot(uuid) to authenticated, service_role;
