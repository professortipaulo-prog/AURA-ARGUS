create schema if not exists core;

-- Registro de tentativas de verificacao facial periodica durante o uso
-- do chat. Quando o rosto capturado nao bate com o cadastrado, a pessoa
-- e desafiada a se identificar por texto -- essa resposta fica aqui,
-- para o dono da conta revisar depois. Isso NAO e uma trava de seguranca
-- a prova de mentira (a resposta digitada nao e verificada automaticamente),
-- e sim uma camada de registro e desencorajamento.
create table if not exists core.face_verification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  matched boolean not null,
  distance numeric null,
  identification_note text null,
  created_at timestamptz not null default now()
);

alter table core.face_verification_log enable row level security;

drop policy if exists face_verification_log_select_own on core.face_verification_log;
create policy face_verification_log_select_own on core.face_verification_log
  for select using (auth.uid() = user_id);

drop policy if exists face_verification_log_insert_own on core.face_verification_log;
create policy face_verification_log_insert_own on core.face_verification_log
  for insert with check (auth.uid() = user_id);

create index if not exists face_verification_log_user_created_idx on core.face_verification_log(user_id, created_at desc);

grant usage on schema core to authenticated, service_role;
grant select, insert on core.face_verification_log to authenticated, service_role;
