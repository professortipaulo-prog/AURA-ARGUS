-- ============================================================
-- AURA/ARGUS - ARQ-DB-001
-- Banco de Dados Definitivo Inicial para Supabase/PostgreSQL
-- Versao: 1.0
-- Data: 2026-07-02
-- Responsavel: Paulo da Silva Filho
-- Objetivo: Base enterprise para agentes AURA/ARGUS com memoria,
--           roteamento de IA, execucao de acoes, documentos e auditoria.
-- ============================================================

-- 0. EXTENSOES
create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- 1. SCHEMAS
create schema if not exists core;
create schema if not exists ai;
create schema if not exists memory;
create schema if not exists action;
create schema if not exists document;
create schema if not exists billing;
create schema if not exists audit;

-- Grants basicos para Supabase/PostgREST quando schemas forem expostos
 grant usage on schema core, ai, memory, action, document, billing, audit to anon, authenticated, service_role;
 alter default privileges in schema core grant select, insert, update, delete on tables to authenticated;
 alter default privileges in schema ai grant select, insert, update, delete on tables to authenticated;
 alter default privileges in schema memory grant select, insert, update, delete on tables to authenticated;
 alter default privileges in schema action grant select, insert, update, delete on tables to authenticated;
 alter default privileges in schema document grant select, insert, update, delete on tables to authenticated;
 alter default privileges in schema billing grant select, insert, update, delete on tables to authenticated;
 alter default privileges in schema audit grant select, insert on tables to authenticated;

-- 2. TIPOS ENUMERADOS
create type core.user_status as enum ('active','inactive','blocked','pending');
create type core.member_role as enum ('owner','admin','manager','operator','viewer','guest');
create type ai.provider_name as enum ('openai','anthropic','google','local','router');
create type ai.agent_status as enum ('draft','active','paused','archived');
create type ai.message_role as enum ('system','user','assistant','tool','developer');
create type memory.memory_type as enum ('temporary','session','project','permanent','profile','preference','instruction');
create type action.action_status as enum ('queued','running','waiting_user','success','failed','cancelled','timeout');
create type document.storage_provider as enum ('supabase','google_drive','onedrive','sharepoint','s3','minio','notebooklm','external_url');
create type document.document_status as enum ('uploaded','processing','indexed','failed','archived');
create type billing.ledger_type as enum ('credit','debit','adjustment','refund');

-- 3. FUNCOES COMUNS
create or replace function core.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function core.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- 4. ORGANIZACOES E PERFIS
create table if not exists core.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  document_number text,
  domain text,
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  email text not null,
  phone text,
  avatar_url text,
  professional_title text,
  company text,
  disc_profile jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  status core.user_status not null default 'active',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references core.organizations(id) on delete cascade,
  user_id uuid not null references core.profiles(id) on delete cascade,
  role core.member_role not null default 'viewer',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- 5. PROJETOS
create table if not exists core.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  owner_id uuid not null references core.profiles(id) on delete cascade,
  title text not null,
  slug text,
  description text,
  status text not null default 'active',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

-- 6. IA: PROVIDERS, MODELOS, AGENTES, SESSOES E MENSAGENS
create table if not exists ai.providers (
  id uuid primary key default gen_random_uuid(),
  name ai.provider_name not null unique,
  display_name text not null,
  enabled boolean not null default true,
  base_url text,
  secret_ref text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai.models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references ai.providers(id) on delete cascade,
  model_key text not null,
  display_name text not null,
  supports_text boolean not null default true,
  supports_vision boolean not null default false,
  supports_audio boolean not null default false,
  supports_tools boolean not null default false,
  context_window integer,
  input_cost_per_1m numeric(12,6) default 0,
  output_cost_per_1m numeric(12,6) default 0,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider_id, model_key)
);

create table if not exists ai.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  owner_id uuid references core.profiles(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  status ai.agent_status not null default 'draft',
  default_provider ai.provider_name default 'router',
  default_model text,
  system_prompt text not null,
  developer_prompt text,
  temperature numeric(3,2) not null default 0.30,
  max_output_tokens integer not null default 4096,
  tools jsonb not null default '[]'::jsonb,
  memory_policy jsonb not null default '{}'::jsonb,
  cost_policy jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists ai.sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  project_id uuid references core.projects(id) on delete set null,
  user_id uuid not null references core.profiles(id) on delete cascade,
  agent_id uuid references ai.agents(id) on delete set null,
  title text,
  summary text,
  status text not null default 'open',
  context_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references ai.sessions(id) on delete cascade,
  user_id uuid references core.profiles(id) on delete set null,
  agent_id uuid references ai.agents(id) on delete set null,
  role ai.message_role not null,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  provider ai.provider_name,
  model text,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer generated always as (prompt_tokens + completion_tokens) stored,
  latency_ms integer,
  cost_usd numeric(12,6) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 7. MEMORIA E EMBEDDINGS
create table if not exists memory.items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  project_id uuid references core.projects(id) on delete cascade,
  user_id uuid references core.profiles(id) on delete cascade,
  agent_id uuid references ai.agents(id) on delete set null,
  type memory.memory_type not null,
  title text,
  content text not null,
  source text,
  importance smallint not null default 3 check (importance between 1 and 5),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memory.embeddings (
  id uuid primary key default gen_random_uuid(),
  memory_item_id uuid references memory.items(id) on delete cascade,
  document_chunk_id uuid,
  organization_id uuid references core.organizations(id) on delete cascade,
  project_id uuid references core.projects(id) on delete cascade,
  user_id uuid references core.profiles(id) on delete cascade,
  content text not null,
  embedding vector(1536) not null,
  embedding_model text not null default 'text-embedding-3-small',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 8. DOCUMENTOS E ARQUIVOS
create table if not exists document.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  project_id uuid references core.projects(id) on delete cascade,
  owner_id uuid references core.profiles(id) on delete set null,
  storage_provider document.storage_provider not null default 'supabase',
  bucket text,
  path text,
  external_url text,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  checksum_sha256 text,
  version integer not null default 1,
  status document.document_status not null default 'uploaded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists document.chunks (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references document.files(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  page_start integer,
  page_end integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (file_id, chunk_index)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_embeddings_document_chunk'
  ) then
    alter table memory.embeddings
      add constraint fk_embeddings_document_chunk
      foreign key (document_chunk_id) references document.chunks(id) on delete cascade;
  end if;
end $$;

-- 9. INTEGRACOES E EXECUCAO DE ACOES
create table if not exists action.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  user_id uuid references core.profiles(id) on delete cascade,
  provider text not null,
  account_email text,
  scopes text[] not null default '{}',
  token_secret_ref text,
  refresh_secret_ref text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, account_email)
);

create table if not exists action.executions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  project_id uuid references core.projects(id) on delete set null,
  session_id uuid references ai.sessions(id) on delete set null,
  user_id uuid references core.profiles(id) on delete set null,
  agent_id uuid references ai.agents(id) on delete set null,
  action_type text not null,
  target_service text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  status action.action_status not null default 'queued',
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  duration_ms integer,
  cost_usd numeric(12,6) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. CUSTOS E BILLING
create table if not exists billing.ledger (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete cascade,
  user_id uuid references core.profiles(id) on delete set null,
  session_id uuid references ai.sessions(id) on delete set null,
  execution_id uuid references action.executions(id) on delete set null,
  type billing.ledger_type not null,
  amount_usd numeric(12,6) not null,
  amount_brl numeric(12,2),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 11. AUDITORIA
create table if not exists audit.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references core.organizations(id) on delete set null,
  actor_id uuid references core.profiles(id) on delete set null,
  event_type text not null,
  entity_schema text,
  entity_table text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 12. TRIGGERS DE UPDATED_AT
drop trigger if exists trg_organizations_updated_at on core.organizations;
create trigger trg_organizations_updated_at before update on core.organizations for each row execute function core.set_updated_at();
drop trigger if exists trg_profiles_updated_at on core.profiles;
create trigger trg_profiles_updated_at before update on core.profiles for each row execute function core.set_updated_at();
drop trigger if exists trg_projects_updated_at on core.projects;
create trigger trg_projects_updated_at before update on core.projects for each row execute function core.set_updated_at();
drop trigger if exists trg_providers_updated_at on ai.providers;
create trigger trg_providers_updated_at before update on ai.providers for each row execute function core.set_updated_at();
drop trigger if exists trg_agents_updated_at on ai.agents;
create trigger trg_agents_updated_at before update on ai.agents for each row execute function core.set_updated_at();
drop trigger if exists trg_sessions_updated_at on ai.sessions;
create trigger trg_sessions_updated_at before update on ai.sessions for each row execute function core.set_updated_at();
drop trigger if exists trg_memory_items_updated_at on memory.items;
create trigger trg_memory_items_updated_at before update on memory.items for each row execute function core.set_updated_at();
drop trigger if exists trg_document_files_updated_at on document.files;
create trigger trg_document_files_updated_at before update on document.files for each row execute function core.set_updated_at();
drop trigger if exists trg_integrations_updated_at on action.integrations;
create trigger trg_integrations_updated_at before update on action.integrations for each row execute function core.set_updated_at();
drop trigger if exists trg_executions_updated_at on action.executions;
create trigger trg_executions_updated_at before update on action.executions for each row execute function core.set_updated_at();

-- 13. INDICES
create index if not exists idx_profiles_email on core.profiles using btree (email);
create index if not exists idx_members_user on core.organization_members(user_id);
create index if not exists idx_projects_owner on core.projects(owner_id);
create index if not exists idx_sessions_user on ai.sessions(user_id, created_at desc);
create index if not exists idx_messages_session on ai.messages(session_id, created_at asc);
create index if not exists idx_messages_content_trgm on ai.messages using gin (content gin_trgm_ops);
create index if not exists idx_memory_scope on memory.items(user_id, project_id, type, created_at desc);
create index if not exists idx_memory_content_trgm on memory.items using gin (content gin_trgm_ops);
create index if not exists idx_files_project on document.files(project_id, created_at desc);
create index if not exists idx_chunks_file on document.chunks(file_id, chunk_index);
create index if not exists idx_actions_status on action.executions(status, created_at desc);
create index if not exists idx_audit_actor on audit.events(actor_id, created_at desc);
create index if not exists idx_billing_org on billing.ledger(organization_id, created_at desc);

-- Indice vetorial. Para bases pequenas, busca sequencial e aceitavel.
-- Recriar apos carga relevante de dados se necessario.
create index if not exists idx_embeddings_vector_cosine
on memory.embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 14. ROW LEVEL SECURITY
alter table core.organizations enable row level security;
alter table core.profiles enable row level security;
alter table core.organization_members enable row level security;
alter table core.projects enable row level security;
alter table ai.agents enable row level security;
alter table ai.sessions enable row level security;
alter table ai.messages enable row level security;
alter table memory.items enable row level security;
alter table memory.embeddings enable row level security;
alter table document.files enable row level security;
alter table document.chunks enable row level security;
alter table action.integrations enable row level security;
alter table action.executions enable row level security;
alter table billing.ledger enable row level security;
alter table audit.events enable row level security;

-- Perfis: usuario le e atualiza seu proprio perfil
create policy "profiles_select_own" on core.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on core.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert_own" on core.profiles for insert to authenticated with check (id = auth.uid());

-- Organizacoes: membro visualiza
create policy "org_select_member" on core.organizations for select to authenticated using (
  exists (select 1 from core.organization_members m where m.organization_id = id and m.user_id = auth.uid())
);

create policy "members_select_self_org" on core.organization_members for select to authenticated using (
  user_id = auth.uid() or exists (select 1 from core.organization_members m where m.organization_id = organization_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager'))
);

-- Projetos: dono ou membro da organizacao
create policy "projects_select_allowed" on core.projects for select to authenticated using (
  owner_id = auth.uid() or exists (select 1 from core.organization_members m where m.organization_id = projects.organization_id and m.user_id = auth.uid())
);
create policy "projects_insert_own" on core.projects for insert to authenticated with check (owner_id = auth.uid());
create policy "projects_update_owner_or_admin" on core.projects for update to authenticated using (
  owner_id = auth.uid() or exists (select 1 from core.organization_members m where m.organization_id = projects.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager'))
);

-- Agentes: visiveis para membros da organizacao; agentes pessoais para owner
create policy "agents_select_allowed" on ai.agents for select to authenticated using (
  owner_id = auth.uid() or exists (select 1 from core.organization_members m where m.organization_id = agents.organization_id and m.user_id = auth.uid())
);
create policy "agents_insert_owner" on ai.agents for insert to authenticated with check (owner_id = auth.uid());
create policy "agents_update_owner_or_admin" on ai.agents for update to authenticated using (
  owner_id = auth.uid() or exists (select 1 from core.organization_members m where m.organization_id = agents.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- Sessoes e mensagens
create policy "sessions_crud_own" on ai.sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "messages_select_session_owner" on ai.messages for select to authenticated using (
  exists (select 1 from ai.sessions s where s.id = messages.session_id and s.user_id = auth.uid())
);
create policy "messages_insert_session_owner" on ai.messages for insert to authenticated with check (
  exists (select 1 from ai.sessions s where s.id = messages.session_id and s.user_id = auth.uid())
);

-- Memorias
create policy "memory_select_own" on memory.items for select to authenticated using (user_id = auth.uid());
create policy "memory_insert_own" on memory.items for insert to authenticated with check (user_id = auth.uid());
create policy "memory_update_own" on memory.items for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "embeddings_select_own" on memory.embeddings for select to authenticated using (user_id = auth.uid());
create policy "embeddings_insert_own" on memory.embeddings for insert to authenticated with check (user_id = auth.uid());

-- Documentos
create policy "files_select_owner" on document.files for select to authenticated using (owner_id = auth.uid());
create policy "files_insert_owner" on document.files for insert to authenticated with check (owner_id = auth.uid());
create policy "files_update_owner" on document.files for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "chunks_select_file_owner" on document.chunks for select to authenticated using (
  exists (select 1 from document.files f where f.id = chunks.file_id and f.owner_id = auth.uid())
);

-- Integracoes e acoes
create policy "integrations_crud_own" on action.integrations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "executions_select_own" on action.executions for select to authenticated using (user_id = auth.uid());
create policy "executions_insert_own" on action.executions for insert to authenticated with check (user_id = auth.uid());
create policy "executions_update_own" on action.executions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Billing e audit: somente leitura do proprio escopo; escrita via backend service_role
create policy "billing_select_member" on billing.ledger for select to authenticated using (
  user_id = auth.uid() or exists (select 1 from core.organization_members m where m.organization_id = ledger.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);
create policy "audit_select_actor" on audit.events for select to authenticated using (actor_id = auth.uid());
create policy "audit_insert_actor" on audit.events for insert to authenticated with check (actor_id = auth.uid());

-- 15. FUNCAO DE BUSCA VETORIAL
create or replace function memory.match_embeddings(
  query_embedding vector(1536),
  match_count int default 8,
  filter_user_id uuid default null,
  filter_project_id uuid default null
)
returns table (
  id uuid,
  content text,
  similarity double precision,
  metadata jsonb
)
language sql stable
as $$
  select
    e.id,
    e.content,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.metadata
  from memory.embeddings e
  where (filter_user_id is null or e.user_id = filter_user_id)
    and (filter_project_id is null or e.project_id = filter_project_id)
  order by e.embedding <=> query_embedding
  limit match_count;
$$;

-- 16. SEEDS INICIAIS
insert into ai.providers (name, display_name, enabled, settings)
values
  ('router','AI Router','true','{}'),
  ('openai','OpenAI','true','{}'),
  ('anthropic','Anthropic Claude','true','{}'),
  ('google','Google Gemini','true','{}')
on conflict (name) do nothing;

insert into ai.models (provider_id, model_key, display_name, supports_text, supports_vision, supports_audio, supports_tools, context_window)
select p.id, 'gemini-2.5-pro', 'Gemini 2.5 Pro', true, true, true, true, 1000000 from ai.providers p where p.name='google'
on conflict do nothing;

insert into ai.models (provider_id, model_key, display_name, supports_text, supports_vision, supports_audio, supports_tools, context_window)
select p.id, 'claude-sonnet-4', 'Claude Sonnet 4', true, true, false, true, 200000 from ai.providers p where p.name='anthropic'
on conflict do nothing;

insert into ai.models (provider_id, model_key, display_name, supports_text, supports_vision, supports_audio, supports_tools, context_window)
select p.id, 'gpt-4.1', 'GPT-4.1', true, true, false, true, 1000000 from ai.providers p where p.name='openai'
on conflict do nothing;

-- 17. STORAGE BUCKETS SUGERIDOS (executar pelo painel Supabase Storage ou via API quando necessario)
-- aura-documents: documentos de usuario/projeto
-- aura-avatars: fotos e logos
-- aura-exports: arquivos gerados para download
-- aura-temp: uploads temporarios

-- FIM DO SCRIPT
