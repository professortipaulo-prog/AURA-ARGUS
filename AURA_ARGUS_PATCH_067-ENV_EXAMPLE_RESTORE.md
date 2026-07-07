# AURA_ARGUS_PATCH_067 — ENV_EXAMPLE_RESTORE

## Objetivo
Restaurar o arquivo `.env.example`, referenciado pelo README e pela
documentação técnica do projeto, mas ausente do repositório atual.

## Causa
O arquivo nunca existia no zip/repositório fornecido nesta sessão, apesar de:
- `README.md` instruir `cp .env.example .env.local` como primeiro passo.
- `docs/REVISAO_TECNICA_GITHUB.md` registrar que ele havia sido criado e
  atualizado em sprints anteriores.

Sem ele, qualquer pessoa clonando o repositório do zero não tem como saber
quais variáveis o projeto espera, nem seus nomes exatos.

## O que foi feito
Extraí, via `grep` no código-fonte real (não na documentação), todas as
variáveis efetivamente lidas por `process.env.*` em `.ts`/`.tsx`, e montei
o arquivo com essa lista real, comentada por finalidade:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — Supabase.
- `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`,
  `DEFAULT_AI_PROVIDER`, `DEFAULT_AI_MODEL`, `GEMINI_DEFAULT_MODEL` —
  usadas de verdade por `/api/ai/chat`.
- `GEMINI_API_KEY`, `AI_ROUTER_DEFAULT_PROVIDER`,
  `AI_ROUTER_FALLBACK_PROVIDER` — política estrutural de
  `modules/ai-router`, ainda não conectada às chamadas reais.
- `AURA_ARGUS_TIMEZONE` — usada por `lib/memory/server.ts` no contexto
  temporal do prompt (default `America/Bahia` se ausente).
- `NEXT_PUBLIC_APP_ENV` — ambiente da aplicação.

Nenhuma chave real foi incluída — todos os valores sensíveis ficam em branco
ou com placeholder.

## Arquivos alterados
- `.env.example` (novo arquivo)
- `docs/AURA_ARGUS_PATCH_067-ENV_EXAMPLE_RESTORE.md` (este documento)

## O que NÃO foi alterado
- Tema claro/escuro — cancelado a pedido de Paulo nesta sessão, sem
  nenhuma alteração de CSS.
- Nenhum outro arquivo de código, CSS, layout ou lógica.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build de produção completo, sem erros
```
(Esperado: adicionar um arquivo `.env.example` não afeta typecheck/build,
já que ele não é importado por nenhum código — validado mesmo assim, por
disciplina.)

## Teste recomendado
1. `cp .env.example .env.local`
2. Preencher com valores reais de desenvolvimento.
3. `npm run dev` e confirmar que a aplicação sobe normalmente.

## Status
Patch aditivo, sem risco — nenhum arquivo existente foi modificado.
