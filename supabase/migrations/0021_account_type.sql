create schema if not exists core;

-- Generaliza o que era so "beta_cohort" (booleano, so pensado pra
-- aluno) em um tipo de conta de verdade -- permite tratar Estudantil,
-- Worker e Plus como categorias distintas, cada uma com sua propria
-- navegacao e pagina inicial, em vez de um unico caminho especial.
alter table core.profiles add column if not exists account_type text null
  check (account_type is null or account_type in ('estudantil', 'worker', 'plus'));

-- Migra os dados que ja existiam sob o nome antigo: quem tinha
-- beta_cohort = true ate agora so podia ser aluno (o unico beta que
-- existia era o Estudantil).
update core.profiles set account_type = 'estudantil' where beta_cohort = true and account_type is null;
