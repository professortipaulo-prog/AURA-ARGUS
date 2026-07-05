# AURA_ARGUS_PATCH_046 - HOTFIX_MEMORY_EXPORTS

## Objetivo
Corrigir falha de build na Vercel causada por exports ausentes em `lib/memory/server.ts`.

## Problema corrigido
As rotas existentes abaixo importavam funções que não estavam mais exportadas:

- `app/api/memory/context/route.ts` → `getMemoryContext`
- `app/api/memory/status/route.ts` → `getMemoryStatus`

## Arquivo alterado
- `lib/memory/server.ts`

## Correção aplicada
Foram adicionadas funções de compatibilidade:

- `getMemoryContext(userId, limit)`
- `getMemoryStatus(userId)`

A correção preserva o PATCH 046 e evita alteração nas rotas antigas, reduzindo risco de regressão.

## Teste técnico
- `npm run typecheck` executado com sucesso.
- `npm run build` compilou e passou pela etapa inicial de build e validação de tipos; o ambiente local encerrou por limite de tempo durante a continuação do build.

## Teste esperado no site
1. Fazer deploy na Vercel.
2. Abrir o site.
3. Abrir Memória.
4. Confirmar que a página carrega com layout.
5. Abrir Chat IA.
6. Enviar uma mensagem.
7. Voltar em Memória e Projetos.
8. Confirmar que os contadores atualizam.

## Status
Hotfix pronto para aplicar no branch main.
