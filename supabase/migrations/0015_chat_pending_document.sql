create schema if not exists core;

-- Guarda um pedido de documento "em espera" enquanto o usuario ainda nao
-- escolheu a borda -- uma linha por (usuario, persona). Curta duracao:
-- e apagada assim que o usuario responde ou gera outro pedido.
create table if not exists core.chat_pending_document (
  user_id uuid not null,
  persona text not null,
  title text not null,
  topic text not null,
  format text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, persona)
);

alter table core.chat_pending_document enable row level security;

drop policy if exists chat_pending_document_all_own on core.chat_pending_document;
create policy chat_pending_document_all_own on core.chat_pending_document
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema core to authenticated, service_role;
grant select, insert, update, delete on core.chat_pending_document to authenticated, service_role;
