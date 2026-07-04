-- PATCH 039 / EPIC 003 - Memory Engine Foundation
-- Execute este script no Supabase SQL Editor depois de aplicar as migracoes anteriores.

create extension if not exists pgcrypto;
create schema if not exists core;

create table if not exists core.memory_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references core.profiles(id) on delete cascade,
  title text not null default 'Nova conversa',
  summary text,
  status text not null default 'active' check (status in ('active','archived','deleted')),
  message_count integer not null default 0,
  last_persona text check (last_persona in ('aura','argus')),
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.memory_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references core.memory_sessions(id) on delete cascade,
  user_id uuid not null references core.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  persona text check (persona in ('aura','argus')),
  provider text,
  model text,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists core.memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references core.profiles(id) on delete cascade,
  session_id uuid references core.memory_sessions(id) on delete set null,
  scope text not null default 'user' check (scope in ('user','session','project','organization')),
  kind text not null default 'note' check (kind in ('fact','preference','project','task','decision','note','summary')),
  title text not null,
  content text not null,
  salience integer not null default 3 check (salience between 1 and 5),
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_memory_sessions_user_updated on core.memory_sessions(user_id, updated_at desc);
create index if not exists idx_memory_sessions_status on core.memory_sessions(user_id, status, last_message_at desc);
create index if not exists idx_memory_messages_session_created on core.memory_messages(session_id, created_at asc);
create index if not exists idx_memory_messages_user_created on core.memory_messages(user_id, created_at desc);
create index if not exists idx_memory_items_user_salience on core.memory_items(user_id, salience desc, updated_at desc);
create index if not exists idx_memory_items_tags on core.memory_items using gin(tags);

alter table core.memory_sessions enable row level security;
alter table core.memory_messages enable row level security;
alter table core.memory_items enable row level security;

drop policy if exists "memory_sessions_own" on core.memory_sessions;
create policy "memory_sessions_own"
on core.memory_sessions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "memory_messages_own" on core.memory_messages;
create policy "memory_messages_own"
on core.memory_messages
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "memory_items_own" on core.memory_items;
create policy "memory_items_own"
on core.memory_items
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.get_memory_context(p_user_id uuid, p_limit integer default 8)
returns jsonb
language plpgsql
security definer
set search_path = public, core
as $$
declare
  result jsonb;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Acesso negado ao contexto de memoria.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'importantMemories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', mi.id,
        'kind', mi.kind,
        'title', mi.title,
        'content', mi.content,
        'salience', mi.salience,
        'tags', mi.tags,
        'updatedAt', mi.updated_at
      ) order by mi.salience desc, mi.updated_at desc)
      from (
        select * from core.memory_items
        where user_id = p_user_id
        order by salience desc, updated_at desc
        limit greatest(1, p_limit)
      ) mi
    ), '[]'::jsonb),
    'recentSessions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ms.id,
        'title', ms.title,
        'summary', ms.summary,
        'messageCount', ms.message_count,
        'lastPersona', ms.last_persona,
        'lastMessageAt', ms.last_message_at
      ) order by ms.last_message_at desc nulls last, ms.updated_at desc)
      from (
        select * from core.memory_sessions
        where user_id = p_user_id and status = 'active'
        order by last_message_at desc nulls last, updated_at desc
        limit greatest(1, p_limit)
      ) ms
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_memory_context(uuid, integer) to authenticated, service_role;
