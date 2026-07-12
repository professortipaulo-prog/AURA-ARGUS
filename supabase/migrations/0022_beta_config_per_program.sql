create schema if not exists core;

-- Generaliza core.beta_config (era uma linha unica, so pensada pra
-- Estudantil) para suportar vagas separadas por programa -- Estudantil
-- e Worker cada um com seu proprio limite, sem competir pela mesma cota.
alter table core.beta_config drop constraint if exists beta_config_pkey;
alter table core.beta_config add column if not exists program text;
update core.beta_config set program = 'estudantil' where program is null;
alter table core.beta_config alter column program set not null;
alter table core.beta_config add constraint beta_config_pkey primary key (program);
alter table core.beta_config drop column if exists id;

insert into core.beta_config (program, max_signups, signup_open)
values ('worker', 15, true)
on conflict (program) do nothing;
