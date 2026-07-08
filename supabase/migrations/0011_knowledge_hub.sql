create schema if not exists core;

create table if not exists core.knowledge_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null default 0,
  storage_path text not null,
  extracted_text text null,
  extraction_status text not null default 'pending',
  extraction_error text null,
  created_at timestamptz not null default now()
);

alter table core.knowledge_files enable row level security;

drop policy if exists knowledge_files_select_own on core.knowledge_files;
create policy knowledge_files_select_own on core.knowledge_files
  for select using (auth.uid() = user_id);

drop policy if exists knowledge_files_insert_own on core.knowledge_files;
create policy knowledge_files_insert_own on core.knowledge_files
  for insert with check (auth.uid() = user_id);

drop policy if exists knowledge_files_delete_own on core.knowledge_files;
create policy knowledge_files_delete_own on core.knowledge_files
  for delete using (auth.uid() = user_id);

create index if not exists knowledge_files_user_created_idx on core.knowledge_files(user_id, created_at desc);
create index if not exists knowledge_files_project_idx on core.knowledge_files(project_id);

grant usage on schema core to authenticated, service_role;
grant select, insert, delete on core.knowledge_files to authenticated, service_role;

-- Bucket de armazenamento dos arquivos originais (privado, não público).
insert into storage.buckets (id, name, public)
values ('knowledge-hub', 'knowledge-hub', false)
on conflict (id) do nothing;

-- Cada usuário só acessa arquivos dentro da sua própria pasta no bucket
-- (caminho no formato "{user_id}/{nome-do-arquivo}").
drop policy if exists knowledge_hub_storage_select_own on storage.objects;
create policy knowledge_hub_storage_select_own on storage.objects
  for select using (bucket_id = 'knowledge-hub' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists knowledge_hub_storage_insert_own on storage.objects;
create policy knowledge_hub_storage_insert_own on storage.objects
  for insert with check (bucket_id = 'knowledge-hub' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists knowledge_hub_storage_delete_own on storage.objects;
create policy knowledge_hub_storage_delete_own on storage.objects
  for delete using (bucket_id = 'knowledge-hub' and auth.uid()::text = (storage.foldername(name))[1]);
