-- PATCH 043B — HOTFIX Project Memory SQL
-- Compatibiliza core.projects existente (title/context) com Project Memory (name/metadata).
-- Execute no Supabase SQL Editor depois do erro do 043/043A.

create extension if not exists pgcrypto;
create schema if not exists core;

-- Garante tabela caso ainda não exista; se já existir, os ALTERs abaixo compatibilizam.
create table if not exists core.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references core.profiles(id) on delete cascade,
  title text,
  name text,
  slug text,
  description text,
  status text not null default 'active',
  context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  color text,
  icon text,
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
  metadata = coalesce(metadata, '{}'::jsonb) || coalesce(context, '{}'::jsonb),
  slug = coalesce(nullif(slug, ''), trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), nullif(title, ''), 'projeto')), '[^a-z0-9]+', '-', 'g')))
where name is null or name = '' or title is null or title = '' or slug is null or slug = '' or metadata is null;

alter table core.projects alter column name set not null;
alter table core.projects alter column title set not null;
alter table core.projects alter column metadata set default '{}'::jsonb;
alter table core.projects alter column context set default '{}'::jsonb;

create index if not exists idx_projects_owner_slug on core.projects(owner_id, slug);
create index if not exists idx_projects_owner_status_updated on core.projects(owner_id, status, updated_at desc);

alter table core.memory_sessions
  add column if not exists project_id uuid references core.projects(id) on delete set null;

alter table core.memory_items
  add column if not exists project_id uuid references core.projects(id) on delete set null;

create index if not exists idx_memory_sessions_project_updated on core.memory_sessions(project_id, updated_at desc);
create index if not exists idx_memory_items_project_salience on core.memory_items(project_id, salience desc, updated_at desc);

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

create index if not exists idx_project_timeline_project_created on core.project_timeline(project_id, created_at desc);
create index if not exists idx_project_timeline_user_created on core.project_timeline(user_id, created_at desc);

alter table core.projects enable row level security;
alter table core.project_timeline enable row level security;

drop policy if exists "projects_own" on core.projects;
create policy "projects_own"
on core.projects
for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "project_timeline_own" on core.project_timeline;
create policy "project_timeline_own"
on core.project_timeline
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.project_slug(p_name text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p_name, 'projeto')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.project_json(p_project core.projects)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', (p_project).id,
    'name', coalesce((p_project).name, (p_project).title),
    'title', coalesce((p_project).title, (p_project).name),
    'slug', (p_project).slug,
    'description', (p_project).description,
    'status', (p_project).status,
    'color', (p_project).color,
    'icon', (p_project).icon,
    'createdAt', (p_project).created_at,
    'updatedAt', (p_project).updated_at,
    'lastActivityAt', (
      select max(ms.last_message_at)
      from core.memory_sessions ms
      where ms.project_id = (p_project).id
    ),
    'memoryCount', (
      select count(*)
      from core.memory_items mi
      where mi.project_id = (p_project).id
    ),
    'sessionCount', (
      select count(*)
      from core.memory_sessions ms
      where ms.project_id = (p_project).id and ms.status = 'active'
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
  base_slug text := 'aura-argus-ai-os';
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao projeto.' using errcode = '42501';
  end if;

  select * into existing
  from core.projects
  where owner_id = p_user_id and status = 'active'
  order by updated_at desc, created_at desc
  limit 1;

  if existing.id is not null then
    return public.project_json(existing);
  end if;

  insert into core.projects (owner_id, title, name, slug, description, color, icon, context, metadata)
  values (
    p_user_id,
    'AURA/ARGUS AI Operating System',
    'AURA/ARGUS AI Operating System',
    base_slug,
    'Projeto principal do sistema AURA/ARGUS: arquitetura, interface, memória, documentos, ações e integrações.',
    '#22d3ee',
    '◈',
    '{"default":true,"source":"patch-043b"}'::jsonb,
    '{"default":true,"source":"patch-043b"}'::jsonb
  )
  on conflict do nothing;

  select * into existing
  from core.projects
  where owner_id = p_user_id and status = 'active'
  order by updated_at desc, created_at desc
  limit 1;

  return public.project_json(existing);
end;
$$;

create or replace function public.list_user_projects(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  result jsonb;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado aos projetos.' using errcode = '42501';
  end if;

  perform public.ensure_default_project(p_user_id);

  select coalesce(jsonb_agg(public.project_json(p) order by p.updated_at desc, p.created_at desc), '[]'::jsonb)
  into result
  from core.projects p
  where p.owner_id = p_user_id and p.status = 'active';

  return result;
end;
$$;

create or replace function public.create_user_project(p_user_id uuid, p_name text, p_description text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  new_project core.projects%rowtype;
  normalized_slug text;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado para criar projeto.' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_name, ''))) < 3 then
    raise exception 'Nome de projeto inválido.' using errcode = '22023';
  end if;

  normalized_slug := coalesce(nullif(public.project_slug(p_name), ''), 'projeto') || '-' || substring(gen_random_uuid()::text from 1 for 8);

  insert into core.projects (owner_id, title, name, slug, description, color, icon, context, metadata)
  values (p_user_id, trim(p_name), trim(p_name), normalized_slug, nullif(trim(coalesce(p_description, '')), ''), '#a855f7', '◆', '{"source":"user"}'::jsonb, '{"source":"user"}'::jsonb)
  returning * into new_project;

  insert into core.project_timeline(project_id, user_id, event_type, title, description, metadata)
  values (new_project.id, p_user_id, 'project_created', 'Projeto criado', 'Projeto criado no AURA/ARGUS.', '{}'::jsonb);

  return public.project_json(new_project);
end;
$$;

create or replace function public.get_project_memory_context(p_user_id uuid, p_project_id uuid default null, p_limit integer default 8)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  selected_project core.projects%rowtype;
  result jsonb;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao contexto de projeto.' using errcode = '42501';
  end if;

  if p_project_id is null then
    perform public.ensure_default_project(p_user_id);
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
    return jsonb_build_object('project', null, 'memory', '[]'::jsonb, 'timeline', '[]'::jsonb);
  end if;

  select jsonb_build_object(
    'project', public.project_json(selected_project),
    'memory', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', mi.id,
        'type', mi.memory_type,
        'content', mi.content,
        'salience', mi.salience,
        'createdAt', mi.created_at,
        'updatedAt', mi.updated_at
      ) order by mi.salience desc, mi.updated_at desc)
      from (
        select *
        from core.memory_items
        where user_id = p_user_id and project_id = selected_project.id
        order by salience desc, updated_at desc
        limit greatest(1, coalesce(p_limit, 8))
      ) mi
    ), '[]'::jsonb),
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventType', pt.event_type,
        'title', pt.title,
        'description', pt.description,
        'createdAt', pt.created_at
      ) order by pt.created_at desc)
      from (
        select *
        from core.project_timeline
        where user_id = p_user_id and project_id = selected_project.id
        order by created_at desc
        limit 8
      ) pt
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.project_slug(text) to authenticated, service_role;
grant execute on function public.project_json(core.projects) to authenticated, service_role;
grant execute on function public.ensure_default_project(uuid) to authenticated, service_role;
grant execute on function public.list_user_projects(uuid) to authenticated, service_role;
grant execute on function public.create_user_project(uuid, text, text) to authenticated, service_role;
grant execute on function public.get_project_memory_context(uuid, uuid, integer) to authenticated, service_role;
