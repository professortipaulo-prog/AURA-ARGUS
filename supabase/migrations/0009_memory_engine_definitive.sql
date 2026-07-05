-- PATCH 045 — MEMORY ENGINE DEFINITIVO
-- Objetivo: ativar persistencia real de conversas, memorias e contexto por projeto.
-- Seguro para bases parcialmente migradas. Pode ser executado mais de uma vez.

create extension if not exists pgcrypto;
create schema if not exists core;

grant usage on schema core to authenticated, service_role;

-- Compatibilidade de perfis e projetos -------------------------------------------------
create table if not exists core.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  display_name text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references core.profiles(id) on delete cascade,
  title text,
  slug text,
  description text,
  status text not null default 'active',
  context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table core.projects add column if not exists owner_id uuid references core.profiles(id) on delete cascade;
alter table core.projects add column if not exists title text;
alter table core.projects add column if not exists name text;
alter table core.projects add column if not exists slug text;
alter table core.projects add column if not exists description text;
alter table core.projects add column if not exists status text not null default 'active';
alter table core.projects add column if not exists context jsonb not null default '{}'::jsonb;
alter table core.projects add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table core.projects add column if not exists color text;
alter table core.projects add column if not exists icon text;
alter table core.projects add column if not exists created_at timestamptz not null default now();
alter table core.projects add column if not exists updated_at timestamptz not null default now();

update core.projects
set
  name = coalesce(nullif(name, ''), nullif(title, ''), 'Projeto'),
  title = coalesce(nullif(title, ''), nullif(name, ''), 'Projeto'),
  slug = coalesce(nullif(slug, ''), trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), nullif(title, ''), 'projeto')), '[^a-z0-9]+', '-', 'g'))),
  metadata = coalesce(metadata, '{}'::jsonb) || coalesce(context, '{}'::jsonb)
where name is null or name = '' or title is null or title = '' or slug is null or slug = '';

-- Tabelas definitivas da memoria -------------------------------------------------------
create table if not exists core.memory_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references core.profiles(id) on delete cascade,
  project_id uuid references core.projects(id) on delete set null,
  title text not null default 'Nova conversa',
  summary text,
  status text not null default 'active',
  message_count integer not null default 0,
  last_persona text,
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.memory_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references core.memory_sessions(id) on delete cascade,
  user_id uuid not null references core.profiles(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  persona text,
  provider text,
  model text,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists core.memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references core.profiles(id) on delete cascade,
  project_id uuid references core.projects(id) on delete cascade,
  session_id uuid references core.memory_sessions(id) on delete set null,
  scope text not null default 'user',
  kind text not null default 'fact',
  title text not null,
  content text not null,
  salience integer not null default 3 check (salience between 1 and 5),
  tags text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.project_timeline (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references core.projects(id) on delete cascade,
  user_id uuid not null references core.profiles(id) on delete cascade,
  event_type text not null default 'note',
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_core_memory_sessions_user_updated on core.memory_sessions(user_id, updated_at desc);
create index if not exists idx_core_memory_sessions_project_updated on core.memory_sessions(project_id, updated_at desc);
create index if not exists idx_core_memory_messages_session_created on core.memory_messages(session_id, created_at);
create index if not exists idx_core_memory_items_user_salience on core.memory_items(user_id, salience desc, updated_at desc);
create index if not exists idx_core_memory_items_project_salience on core.memory_items(project_id, salience desc, updated_at desc);
create index if not exists idx_core_project_timeline_project_created on core.project_timeline(project_id, created_at desc);

-- RLS e policies ------------------------------------------------------------------------
alter table core.memory_sessions enable row level security;
alter table core.memory_messages enable row level security;
alter table core.memory_items enable row level security;
alter table core.project_timeline enable row level security;

drop policy if exists memory_sessions_own_select on core.memory_sessions;
create policy memory_sessions_own_select on core.memory_sessions for select to authenticated using (user_id = auth.uid());
drop policy if exists memory_sessions_own_write on core.memory_sessions;
create policy memory_sessions_own_write on core.memory_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists memory_messages_own_select on core.memory_messages;
create policy memory_messages_own_select on core.memory_messages for select to authenticated using (user_id = auth.uid());
drop policy if exists memory_messages_own_write on core.memory_messages;
create policy memory_messages_own_write on core.memory_messages for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists memory_items_own_select on core.memory_items;
create policy memory_items_own_select on core.memory_items for select to authenticated using (user_id = auth.uid());
drop policy if exists memory_items_own_write on core.memory_items;
create policy memory_items_own_write on core.memory_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists project_timeline_own_select on core.project_timeline;
create policy project_timeline_own_select on core.project_timeline for select to authenticated using (user_id = auth.uid());
drop policy if exists project_timeline_own_write on core.project_timeline;
create policy project_timeline_own_write on core.project_timeline for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on core.memory_sessions to authenticated, service_role;
grant select, insert, update, delete on core.memory_messages to authenticated, service_role;
grant select, insert, update, delete on core.memory_items to authenticated, service_role;
grant select, insert, update, delete on core.project_timeline to authenticated, service_role;
grant select, insert, update, delete on core.projects to authenticated, service_role;
grant select, insert, update, delete on core.profiles to authenticated, service_role;

-- Funcoes RPC ----------------------------------------------------------------------------
create or replace function public.project_json(p_project core.projects)
returns jsonb
language sql
stable
security definer
set search_path = public, core
as $$
  select jsonb_build_object(
    'id', (p_project).id,
    'name', coalesce((p_project).name, (p_project).title, 'Projeto'),
    'title', coalesce((p_project).title, (p_project).name, 'Projeto'),
    'slug', (p_project).slug,
    'description', (p_project).description,
    'status', (p_project).status,
    'color', (p_project).color,
    'icon', (p_project).icon,
    'createdAt', (p_project).created_at,
    'updatedAt', (p_project).updated_at,
    'memoryCount', (select count(*) from core.memory_items mi where mi.project_id = (p_project).id),
    'sessionCount', (select count(*) from core.memory_sessions ms where ms.project_id = (p_project).id and ms.status = 'active'),
    'lastActivityAt', greatest(
      coalesce((select max(mi.updated_at) from core.memory_items mi where mi.project_id = (p_project).id), (p_project).updated_at),
      coalesce((select max(ms.updated_at) from core.memory_sessions ms where ms.project_id = (p_project).id), (p_project).updated_at)
    )
  );
$$;

create or replace function public.ensure_default_project(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  existing core.projects%rowtype;
  user_email text;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao projeto.' using errcode = '42501';
  end if;

  select email into user_email from auth.users where id = p_user_id;
  insert into core.profiles(id, email)
  values (p_user_id, coalesce(user_email, concat(p_user_id::text, '@local')))
  on conflict (id) do nothing;

  select * into existing
  from core.projects
  where owner_id = p_user_id and status = 'active'
  order by updated_at desc, created_at desc
  limit 1;

  if existing.id is null then
    insert into core.projects(owner_id, title, name, slug, description, status, metadata)
    values (
      p_user_id,
      'AURA/ARGUS AI Operating System',
      'AURA/ARGUS AI Operating System',
      'aura-argus-ai-operating-system',
      'Projeto principal do sistema AURA/ARGUS: arquitetura, interface, memória, documentos, ações e integrações.',
      'active',
      '{"default": true}'::jsonb
    )
    returning * into existing;
  end if;

  return public.project_json(existing);
end;
$$;

create or replace function public.list_user_projects(p_user_id uuid)
returns setof jsonb
language plpgsql
security definer
set search_path = public, core
as $$
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado aos projetos.' using errcode = '42501';
  end if;

  perform public.ensure_default_project(p_user_id);

  return query
  select public.project_json(p)
  from core.projects p
  where p.owner_id = p_user_id and p.status = 'active'
  order by p.updated_at desc, p.created_at desc;
end;
$$;

create or replace function public.create_user_project(p_user_id uuid, p_name text, p_description text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  created core.projects%rowtype;
  base_slug text;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao criar projeto.' using errcode = '42501';
  end if;

  perform public.ensure_default_project(p_user_id);
  base_slug := trim(both '-' from regexp_replace(lower(coalesce(nullif(p_name, ''), 'projeto')), '[^a-z0-9]+', '-', 'g'));

  insert into core.projects(owner_id, title, name, slug, description, status)
  values (p_user_id, p_name, p_name, concat(base_slug, '-', substr(gen_random_uuid()::text, 1, 8)), p_description, 'active')
  returning * into created;

  return public.project_json(created);
end;
$$;

create or replace function public.get_project_memory_context(p_user_id uuid, p_project_id uuid default null, p_limit integer default 10)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  selected_project core.projects%rowtype;
  result jsonb;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao contexto de projeto.' using errcode = '42501';
  end if;

  perform public.ensure_default_project(p_user_id);

  if p_project_id is null then
    select * into selected_project
    from core.projects
    where owner_id = p_user_id and status = 'active'
    order by updated_at desc, created_at desc
    limit 1;
  else
    select * into selected_project
    from core.projects
    where id = p_project_id and owner_id = p_user_id and status = 'active'
    limit 1;
  end if;

  if selected_project.id is null then
    return jsonb_build_object(
      'project', null,
      'projectMemories', '[]'::jsonb,
      'importantMemories', '[]'::jsonb,
      'recentSessions', '[]'::jsonb,
      'timeline', '[]'::jsonb
    );
  end if;

  select jsonb_build_object(
    'project', public.project_json(selected_project),
    'projectMemories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', mi.id,
        'kind', mi.kind,
        'title', mi.title,
        'content', mi.content,
        'salience', mi.salience,
        'tags', mi.tags,
        'projectId', mi.project_id,
        'updatedAt', mi.updated_at
      ) order by mi.salience desc, mi.updated_at desc)
      from (
        select * from core.memory_items
        where user_id = p_user_id and project_id = selected_project.id
        order by salience desc, updated_at desc
        limit greatest(1, coalesce(p_limit, 10))
      ) mi
    ), '[]'::jsonb),
    'importantMemories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', mi.id,
        'kind', mi.kind,
        'title', mi.title,
        'content', mi.content,
        'salience', mi.salience,
        'tags', mi.tags,
        'projectId', mi.project_id,
        'updatedAt', mi.updated_at
      ) order by mi.salience desc, mi.updated_at desc)
      from (
        select * from core.memory_items
        where user_id = p_user_id and project_id is null and scope = 'user'
        order by salience desc, updated_at desc
        limit greatest(1, coalesce(p_limit, 10))
      ) mi
    ), '[]'::jsonb),
    'recentSessions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ms.id,
        'title', ms.title,
        'summary', ms.summary,
        'messageCount', ms.message_count,
        'lastPersona', ms.last_persona,
        'lastMessageAt', ms.last_message_at,
        'projectId', ms.project_id
      ) order by ms.last_message_at desc nulls last, ms.updated_at desc)
      from (
        select * from core.memory_sessions
        where user_id = p_user_id and status = 'active' and project_id = selected_project.id
        order by last_message_at desc nulls last, updated_at desc
        limit greatest(1, coalesce(p_limit, 10))
      ) ms
    ), '[]'::jsonb),
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventType', pt.event_type,
        'title', pt.title,
        'description', pt.description,
        'createdAt', pt.created_at
      ) order by pt.created_at desc)
      from (
        select * from core.project_timeline
        where user_id = p_user_id and project_id = selected_project.id
        order by created_at desc
        limit greatest(1, coalesce(p_limit, 10))
      ) pt
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

create or replace function public.get_memory_context(p_user_id uuid, p_limit integer default 10)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado a memoria.' using errcode = '42501';
  end if;
  return public.get_project_memory_context(p_user_id, null, p_limit);
end;
$$;

create or replace function public.get_memory_engine_status(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  last_use timestamptz;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao status da memoria.' using errcode = '42501';
  end if;

  perform public.ensure_default_project(p_user_id);

  select max(last_message_at) into last_use
  from core.memory_sessions
  where user_id = p_user_id;

  return jsonb_build_object(
    'migrationApplied', true,
    'sessions', (select count(*) from core.memory_sessions where user_id = p_user_id),
    'messages', (select count(*) from core.memory_messages where user_id = p_user_id),
    'memories', (select count(*) from core.memory_items where user_id = p_user_id),
    'projects', (select count(*) from core.projects where owner_id = p_user_id and status = 'active'),
    'lastUse', last_use
  );
end;
$$;

grant execute on function public.project_json(core.projects) to authenticated, service_role;
grant execute on function public.ensure_default_project(uuid) to authenticated, service_role;
grant execute on function public.list_user_projects(uuid) to authenticated, service_role;
grant execute on function public.create_user_project(uuid, text, text) to authenticated, service_role;
grant execute on function public.get_project_memory_context(uuid, uuid, integer) to authenticated, service_role;
grant execute on function public.get_memory_context(uuid, integer) to authenticated, service_role;
grant execute on function public.get_memory_engine_status(uuid) to authenticated, service_role;
