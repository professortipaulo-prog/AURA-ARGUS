-- EPIC-001 FIX — Profile Engine RPC bridge
-- Resolve o problema "Invalid schema: core" sem exigir exposição do schema core na Data API.

create table if not exists core.user_profile_intelligence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_data jsonb not null default '{}'::jsonb,
  user_context jsonb not null default '{}'::jsonb,
  completion_percent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table core.user_profile_intelligence enable row level security;

drop policy if exists "profile intelligence select own" on core.user_profile_intelligence;
create policy "profile intelligence select own"
on core.user_profile_intelligence
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profile intelligence update own" on core.user_profile_intelligence;
create policy "profile intelligence update own"
on core.user_profile_intelligence
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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
  select upi.profile_data, upi.user_context, upi.completion_percent, upi.updated_at
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
  v_title text := coalesce(p_profile #>> '{professional,title}', '');
  v_company text := coalesce(p_profile #>> '{professional,company}', '');
begin
  if auth.uid() is distinct from p_user_id and auth.role() <> 'service_role' then
    raise exception 'Acesso negado ao perfil solicitado.';
  end if;

  insert into core.user_profile_intelligence (user_id, profile_data, user_context, completion_percent, updated_at)
  values (p_user_id, p_profile, p_context, greatest(0, least(100, coalesce(p_completion, 0))), now())
  on conflict (user_id) do update
  set profile_data = excluded.profile_data,
      user_context = excluded.user_context,
      completion_percent = excluded.completion_percent,
      updated_at = now();

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
    jsonb_build_object('user_context', p_context, 'profile_completion', p_completion),
    'active',
    now(),
    now()
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, core.profiles.full_name),
      display_name = coalesce(excluded.display_name, core.profiles.display_name),
      email = excluded.email,
      professional_title = coalesce(excluded.professional_title, core.profiles.professional_title),
      company = coalesce(excluded.company, core.profiles.company),
      preferences = coalesce(core.profiles.preferences, '{}'::jsonb) || jsonb_build_object('user_context', p_context, 'profile_completion', p_completion),
      updated_at = now();
end;
$$;

grant execute on function public.upsert_user_profile_intelligence(uuid, text, jsonb, jsonb, integer) to authenticated, service_role;
