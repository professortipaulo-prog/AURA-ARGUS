create schema if not exists core;

create table if not exists core.action_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid null,
  action text not null,
  status text not null default 'completed',
  request_payload jsonb not null default '{}'::jsonb,
  result_payload jsonb not null default '{}'::jsonb,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.action_artifacts (
  id uuid primary key default gen_random_uuid(),
  action_run_id uuid references core.action_runs(id) on delete cascade,
  user_id uuid not null,
  project_id uuid null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null default 0,
  storage_path text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table core.action_runs enable row level security;
alter table core.action_artifacts enable row level security;

drop policy if exists action_runs_select_own on core.action_runs;
create policy action_runs_select_own on core.action_runs
  for select using (auth.uid() = user_id);

drop policy if exists action_runs_insert_own on core.action_runs;
create policy action_runs_insert_own on core.action_runs
  for insert with check (auth.uid() = user_id);

drop policy if exists action_artifacts_select_own on core.action_artifacts;
create policy action_artifacts_select_own on core.action_artifacts
  for select using (auth.uid() = user_id);

drop policy if exists action_artifacts_insert_own on core.action_artifacts;
create policy action_artifacts_insert_own on core.action_artifacts
  for insert with check (auth.uid() = user_id);

create index if not exists action_runs_user_created_idx on core.action_runs(user_id, created_at desc);
create index if not exists action_runs_project_created_idx on core.action_runs(project_id, created_at desc);
create index if not exists action_artifacts_user_created_idx on core.action_artifacts(user_id, created_at desc);

grant usage on schema core to authenticated, service_role;
grant select, insert, update on core.action_runs to authenticated, service_role;
grant select, insert, update on core.action_artifacts to authenticated, service_role;
