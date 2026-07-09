create schema if not exists core;

-- Guarda apenas o DESCRITOR matematico do rosto (um vetor de 128 numeros
-- gerado pelo face-api.js no navegador do usuario) -- nunca a foto ou
-- video. O descritor nao permite reconstruir a imagem do rosto.
create table if not exists core.face_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  descriptor jsonb not null,
  consent_given_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table core.face_enrollments enable row level security;

drop policy if exists face_enrollments_select_own on core.face_enrollments;
create policy face_enrollments_select_own on core.face_enrollments
  for select using (auth.uid() = user_id);

drop policy if exists face_enrollments_insert_own on core.face_enrollments;
create policy face_enrollments_insert_own on core.face_enrollments
  for insert with check (auth.uid() = user_id);

drop policy if exists face_enrollments_update_own on core.face_enrollments;
create policy face_enrollments_update_own on core.face_enrollments
  for update using (auth.uid() = user_id);

drop policy if exists face_enrollments_delete_own on core.face_enrollments;
create policy face_enrollments_delete_own on core.face_enrollments
  for delete using (auth.uid() = user_id);

grant usage on schema core to authenticated, service_role;
grant select, insert, update, delete on core.face_enrollments to authenticated, service_role;
