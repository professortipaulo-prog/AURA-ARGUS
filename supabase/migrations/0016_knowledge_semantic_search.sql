create schema if not exists core;

-- Habilita a extensao de busca vetorial do Postgres. O Supabase permite
-- habilitar esta extensao especifica via SQL normal (nao exige acesso de
-- superusuario fora do que o Supabase ja concede).
create extension if not exists vector;

-- Vetor de embedding (768 dimensoes, modelo text-embedding-004 do
-- Google) para cada arquivo da base de conhecimento. Arquivos enviados
-- antes desta migracao ficam com este campo nulo ate serem reindexados.
alter table core.knowledge_files add column if not exists embedding vector(768);

-- Indice para busca por similaridade (distancia de cosseno) eficiente.
-- Sem isso, a busca ainda funciona, so fica mais lenta com muitos arquivos.
create index if not exists knowledge_files_embedding_idx
  on core.knowledge_files
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Funcao de busca por similaridade -- necessaria porque o operador de
-- distancia vetorial (<=>) nao e acessivel diretamente pelo construtor de
-- consultas do cliente Supabase JS, so via uma funcao SQL exposta por RPC.
create or replace function core.match_knowledge_files(
  query_embedding vector(768),
  match_user_id uuid,
  match_count int default 3
)
returns table (
  id uuid,
  file_name text,
  extracted_text text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_files.id,
    knowledge_files.file_name,
    knowledge_files.extracted_text,
    1 - (knowledge_files.embedding <=> query_embedding) as similarity
  from core.knowledge_files
  where knowledge_files.user_id = match_user_id
    and knowledge_files.embedding is not null
    and knowledge_files.extraction_status = 'done'
  order by knowledge_files.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function core.match_knowledge_files(vector(768), uuid, int) to authenticated, service_role;
