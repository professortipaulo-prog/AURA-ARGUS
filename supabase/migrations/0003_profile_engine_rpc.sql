-- EPIC-001 FIX — Profile Engine RPC bridge v2
-- Corrige o erro: column upi.profile_data does not exist
-- Compatível com a tabela criada pela migration 0002_profile_engine.sql.

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
  completion_percent integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coluna compacta usada pelo frontend novo. Se a tabela ja existia pela migration 0002,
-- ela nao tinha esta coluna; por isso o erro anterior acontecia.
alter table core.user_profile_intelligence
  add column if not exists profile_data jsonb not null default '{}'::jsonb;

alter table core.user_profile_intelligence
  add column if not exists user_context jsonb not null default '{}'::jsonb;

alter table core.user_profile_intelligence
  add column if not exists completion_percent integer not null default 0;

alter table core.user_profile_intelligence
  add column if not exists updated_at timestamptz not null default now();

alter table core.user_profile_intelligence enable row level security;

drop policy if exists "profile intelligence select own" on core.user_profile_intelligence;
create policy "profile intelligence select own"
on core.user_profile_intelligence
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profile intelligence all own" on core.user_profile_intelligence;
create policy "profile intelligence all own"
on core.user_profile_intelligence
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_user_profile_intelligence_completion
on core.user_profile_intelligence(completion_percent);

create index if not exists idx_user_profile_intelligence_context
on core.user_profile_intelligence using gin (user_context);

create or replace function public.get_user_profile_intelligence(p_user_id uuid)
returns table (
  profile_data jsonb,
  user_context jsonb,
  completion_percent integer,
  updated_at timestamptz
)
language sql
security definer
set search_path = public, core
as $$
  select
    case
      when coalesce(upi.profile_data, '{}'::jsonb) <> '{}'::jsonb then upi.profile_data
      else jsonb_build_object(
        'personal', upi.personal,
        'professional', upi.professional,
        'behavior', upi.behavioral,
        'goals', upi.goals,
        'routine', upi.routine,
        'tools', upi.tools,
        'skills', upi.skills,
        'aiPreferences', upi.ai_preferences
      )
    end as profile_data,
    upi.user_context,
    upi.completion_percent,
    upi.updated_at
  from core.user_profile_intelligence upi
  where upi.user_id = p_user_id
    and (auth.uid() = p_user_id or auth.role() = 'service_role')
  limit 1;
$$;

grant execute on function public.get_user_profile_intelligence(uuid) to authenticated, service_role;

create or replace function public.upsert_user_profile_intelligence(
  p_user_id uuid,
  p_email text,
  p_profile jsonb,
  p_context jsonb,
  p_completion integer
)
returns void
language plpgsql
security definer
set search_path = public, core
as $$
declare
  v_full_name text := coalesce(p_profile #>> '{personal,fullName}', '');
  v_preferred_name text := coalesce(p_profile #>> '{personal,preferredName}', '');
  v_city text := coalesce(p_profile #>> '{personal,city}', '');
  v_country text := coalesce(p_profile #>> '{personal,country}', '');
  v_title text := coalesce(p_profile #>> '{professional,title}', '');
  v_company text := coalesce(p_profile #>> '{professional,company}', '');
  v_completion integer := greatest(0, least(100, coalesce(p_completion, 0)));
begin
  if auth.uid() is distinct from p_user_id and auth.role() <> 'service_role' then
    raise exception 'Acesso negado ao perfil solicitado.';
  end if;

  -- Primeiro garante o registro base em core.profiles.
  insert into core.profiles (
    id,
    full_name,
    display_name,
    email,
    professional_title,
    company,
    preferences,
    status,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    nullif(v_full_name, ''),
    nullif(v_preferred_name, ''),
    p_email,
    nullif(v_title, ''),
    nullif(v_company, ''),
    jsonb_build_object(
      'user_context', p_context,
      'profile_completion', v_completion,
      'location', jsonb_build_object('city', nullif(v_city, ''), 'country', nullif(v_country, ''))
    ),
    'active',
    now(),
    now()
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    display_name = coalesce(excluded.display_name, profiles.display_name),
    email = excluded.email,
    professional_title = coalesce(excluded.professional_title, profiles.professional_title),
    company = coalesce(excluded.company, profiles.company),
    preferences = coalesce(profiles.preferences, '{}'::jsonb) || excluded.preferences,
    updated_at = now();

  -- Depois salva o Profile Engine completo.
  insert into core.user_profile_intelligence (
    user_id,
    profile_data,
    personal,
    professional,
    behavioral,
    goals,
    routine,
    tools,
    skills,
    ai_preferences,
    user_context,
    completion_percent,
    completed_at,
    updated_at
  )
  values (
    p_user_id,
    p_profile,
    coalesce(p_profile -> 'personal', '{}'::jsonb),
    coalesce(p_profile -> 'professional', '{}'::jsonb),
    coalesce(p_profile -> 'behavior', '{}'::jsonb),
    coalesce(p_profile -> 'goals', '{}'::jsonb),
    coalesce(p_profile -> 'routine', '{}'::jsonb),
    coalesce(p_profile -> 'tools', '{}'::jsonb),
    coalesce(p_profile -> 'skills', '{}'::jsonb),
    coalesce(p_profile -> 'aiPreferences', '{}'::jsonb),
    p_context,
    v_completion,
    case when v_completion >= 100 then now() else null end,
    now()
  )
  on conflict (user_id) do update
  set
    profile_data = excluded.profile_data,
    personal = excluded.personal,
    professional = excluded.professional,
    behavioral = excluded.behavioral,
    goals = excluded.goals,
    routine = excluded.routine,
    tools = excluded.tools,
    skills = excluded.skills,
    ai_preferences = excluded.ai_preferences,
    user_context = excluded.user_context,
    completion_percent = excluded.completion_percent,
    completed_at = excluded.completed_at,
    updated_at = now();
end;
$$;

grant execute on function public.upsert_user_profile_intelligence(uuid, text, jsonb, jsonb, integer) to authenticated, service_role;
