-- PATCH 044 — Memory Consolidation Engine
-- Consolida a leitura da memoria de projeto e torna a RPC compatível com bases que usam title/name.

create extension if not exists pgcrypto;
create schema if not exists core;

alter table core.projects add column if not exists owner_id uuid references core.profiles(id) on delete cascade;
alter table core.projects add column if not exists title text;
alter table core.projects add column if not exists name text;
alter table core.projects add column if not exists slug text;
alter table core.projects add column if not exists description text;
alter table core.projects add column if not exists status text not null default 'active';
alter table core.projects add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table core.projects add column if not exists context jsonb not null default '{}'::jsonb;
alter table core.projects add column if not exists updated_at timestamptz not null default now();
alter table core.projects add column if not exists created_at timestamptz not null default now();

update core.projects
set
  name = coalesce(nullif(name, ''), nullif(title, ''), 'Projeto'),
  title = coalesce(nullif(title, ''), nullif(name, ''), 'Projeto'),
  slug = coalesce(nullif(slug, ''), trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), nullif(title, ''), 'projeto')), '[^a-z0-9]+', '-', 'g'))),
  metadata = coalesce(metadata, '{}'::jsonb) || coalesce(context, '{}'::jsonb)
where name is null or name = '' or title is null or title = '' or slug is null or slug = '';

alter table core.memory_sessions add column if not exists project_id uuid references core.projects(id) on delete set null;
alter table core.memory_items add column if not exists project_id uuid references core.projects(id) on delete set null;

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

create index if not exists idx_memory_items_project_salience on core.memory_items(project_id, salience desc, updated_at desc);
create index if not exists idx_memory_sessions_project_updated on core.memory_sessions(project_id, updated_at desc);
create index if not exists idx_project_timeline_project_created on core.project_timeline(project_id, created_at desc);

create or replace function public.project_json(p_project core.projects)
returns jsonb
language sql
stable
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
    'sessionCount', (select count(*) from core.memory_sessions ms where ms.project_id = (p_project).id and ms.status = 'active')
  );
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
        limit greatest(1, coalesce(p_limit, 8))
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
        limit greatest(1, coalesce(p_limit, 8))
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
        limit greatest(1, coalesce(p_limit, 8))
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
        limit greatest(1, coalesce(p_limit, 8))
      ) pt
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.project_json(core.projects) to authenticated, service_role;
grant execute on function public.get_project_memory_context(uuid, uuid, integer) to authenticated, service_role;
