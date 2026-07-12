create schema if not exists core;

-- Data/hora do primeiro acesso real (login) -- e a partir daqui que o
-- relogio de 7 dias do teste comeca a contar, nao da data do cadastro.
alter table core.profiles add column if not exists first_access_at timestamptz null;

-- Marca contas criadas pelo formulario publico do beta (para contar
-- vagas e aplicar o limite de 7 dias so a esse grupo).
alter table core.profiles add column if not exists beta_cohort boolean not null default false;

-- Configuracao do beta: quantas vagas existem, e se o cadastro esta
-- aberto. Linha unica (singleton), Paulo pode ajustar via SQL se
-- precisar mudar o numero de vagas depois.
create table if not exists core.beta_config (
  id boolean primary key default true check (id),
  max_signups int not null default 15,
  signup_open boolean not null default true
);
insert into core.beta_config (id, max_signups, signup_open)
values (true, 15, true)
on conflict (id) do nothing;
