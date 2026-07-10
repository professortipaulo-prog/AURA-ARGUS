# AURA_ARGUS_PATCH_111 — KNOWLEDGE_SEMANTIC_SEARCH

## Objetivo
Substituir a busca por palavra-chave (v1, PATCH_086) por busca por
**significado** (embeddings/vetores) na base de conhecimento — resolve a
limitação registrada desde o início: perguntas parafraseadas ou com
sinônimos diferentes do texto original passam a encontrar o arquivo
certo mesmo assim.

## Provedor escolhido
**Google (`text-embedding-004`, 768 dimensões)** — reaproveita a mesma
chave (`GOOGLE_GENERATIVE_AI_API_KEY`) já configurada para o ARGUS/Gemini,
sem precisar de mais um provedor externo novo. Modelo escolhido
especificamente por compatibilidade com a versão já instalada do SDK do
Google (`@google/generative-ai@0.21.0`) — o modelo mais novo
(`gemini-embedding-001`, com dimensão configurável) pertence a uma versão
mais recente da biblioteca, não testada neste projeto.

## Como funciona agora (busca em 2 camadas)

1. **Busca semântica** (nova, prioritária): a pergunta do usuário vira um
   vetor de 768 números; o banco compara esse vetor com o de cada
   arquivo já indexado, usando distância de cosseno — encontra o
   arquivo mais parecido em **significado**, não só em palavras exatas.
2. **Busca por palavra-chave** (a antiga, PATCH_086): continua ativa,
   mas agora só para arquivos **enviados antes deste patch**, que ainda
   não têm o vetor de embedding calculado. Garante que nada enviado
   antes deixe de ser encontrado.

Arquivos novos, enviados a partir de agora, já recebem o embedding
automaticamente no momento do upload — não precisa de nenhuma ação
extra.

## Arquivos já enviados antes deste patch — reindexação
Como o vetor de embedding não existe retroativamente, adicionei um botão
**"Atualizar busca dos arquivos antigos"** na Central de Conhecimento —
processa todos os arquivos existentes do usuário que ainda não têm
embedding, uma vez.

## Banco de dados
- Extensão `vector` do Postgres habilitada (pgvector) — via SQL comum,
  não precisa de acesso especial além do que o Supabase já concede.
- Nova coluna `embedding vector(768)` em `core.knowledge_files`.
- Índice `ivfflat` para busca por similaridade eficiente.
- Nova função SQL `core.match_knowledge_files()` — necessária porque o
  operador de distância vetorial do Postgres não é acessível direto pelo
  construtor de consultas do Supabase JS, só via uma função exposta por
  RPC.

## Arquivos novos
- `supabase/migrations/0016_knowledge_semantic_search.sql`
- `lib/knowledge/embeddings.ts` (`generateEmbedding`)
- `app/api/knowledge/reindex/route.ts`

## Arquivos alterados
- `lib/knowledge/server.ts` (`saveKnowledgeFile` gera embedding no
  upload; `getKnowledgeContext` reescrita para busca híbrida;
  `reindexKnowledgeEmbeddings` nova)
- `app/dashboard/documents/page.tsx` (botão de reindexação)

## O que NÃO foi alterado
- A extração de texto (PDF/DOCX/TXT/MD) — reaproveitada sem alteração.
- O restante do fluxo de upload, listagem, exclusão de arquivos.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test          # 19 testes, todos passando (nenhum quebrado)
npm run build          # build completo
```

## ⚠️ Limitações honestas
1. **Não testei a chamada real de embedding neste ambiente** — não tenho
   acesso ao endpoint do Google a partir daqui. A implementação segue a
   documentação oficial (`embedContent`, modelo `text-embedding-004`,
   768 dimensões), mas só o teste ao vivo confirma 100%.
2. **Extensão `vector` precisa estar disponível no seu projeto Supabase.**
   A grande maioria dos projetos Supabase já vem com ela disponível
   (é uma extensão padrão do PostgreSQL usada amplamente), mas se a
   migração falhar especificamente na linha `create extension`, me avise
   — pode ser necessário habilitá-la manualmente pelo painel do Supabase
   (Database → Extensions → vector) antes de rodar o resto da migração.
3. Se a chamada de embedding falhar por qualquer motivo (chave ausente,
   erro de rede, limite de uso), o sistema **não quebra** — o arquivo é
   salvo normalmente, só sem busca semântica (cai para a busca por
   palavra-chave até ser reindexado).

## Passo extra necessário — migração no Supabase
Rodar `supabase/migrations/0016_knowledge_semantic_search.sql` no SQL
Editor antes de testar.

## Teste funcional recomendado
1. Aplicar a migração.
2. Subir os arquivos deste patch.
3. Ir em Documentos → clicar "Atualizar busca dos arquivos antigos" (pra
   reindexar o currículo e outros arquivos já enviados antes).
4. Perguntar no chat algo **parafraseado**, com palavras diferentes do
   texto original do arquivo (ex: em vez de "quais publicações eu tenho",
   perguntar "quais livros e artigos eu já escrevi") — confirmar que
   encontra a informação mesmo com palavras diferentes.
5. Enviar um arquivo novo e confirmar que ele já funciona com busca
   semântica sem precisar reindexar.

## Status
Implementado e validado por build + testes automatizados (lógica não
dependente de rede). Chamada real à API de embeddings do Google não
testada neste ambiente — depende de teste ao vivo para confirmação final.
