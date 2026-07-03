-- AURA/ARGUS - EPIC 001 Profile Engine
-- Execute no Supabase SQL Editor se a migration ainda nao tiver sido aplicada.

create table if not exists core.user_profile_intelligence (
  user_id uuid primary key references core.profiles(id) on delete cascade,
  personal jsonb not null default '{}'::jsonb,
  professional jsonb not null default '{}'::jsonb,
  behavioral jsonb not null default '{}'::jsonb,
  goals jsonb not null default '{}'::jsonb,
  routine jsonb not null default '{}'::jsonb,
  tools jsonb not null default '{}'::jsonb,
  skills jsonb not null default '{}'::jsonb,
  ai_preferences jsonb not null default '{}'::jsonb,
  user_context jsonb not null default '{}'::jsonb,
  completion_percent integer not null default 0 check (completion_percent >= 0 and completion_percent <= 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profile_intelligence_completion on core.user_profile_intelligence(completion_percent);
create index if not exists idx_user_profile_intelligence_context on core.user_profile_intelligence using gin (user_context);

alter table core.user_profile_intelligence enable row level security;

drop policy if exists "user_profile_intelligence_select_own" on core.user_profile_intelligence;
create policy "user_profile_intelligence_select_own" on core.user_profile_intelligence
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_profile_intelligence_insert_own" on core.user_profile_intelligence;
create policy "user_profile_intelligence_insert_own" on core.user_profile_intelligence
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_profile_intelligence_update_own" on core.user_profile_intelligence;
create policy "user_profile_intelligence_update_own" on core.user_profile_intelligence
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop trigger if exists trg_user_profile_intelligence_updated_at on core.user_profile_intelligence;
create trigger trg_user_profile_intelligence_updated_at
before update on core.user_profile_intelligence
for each row execute function core.set_updated_at();
