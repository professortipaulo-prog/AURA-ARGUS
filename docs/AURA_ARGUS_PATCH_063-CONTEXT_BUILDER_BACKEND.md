# AURA_ARGUS_PATCH_063 — CONTEXT_BUILDER_BACKEND

## Objetivo
Corrigir a recuperação de preferências pessoais no Context Builder backend, sem alterar interface, CSS, login, landing ou visual do chat.

## Problema corrigido
O sistema já gravava e contava memórias, mas preferências simples como “gosto de azul” não eram recuperadas na pergunta seguinte “qual minha cor favorita?”.

## Alterações realizadas
- Inclusão de extração explícita de preferência de cor favorita.
- Inclusão de extração explícita de editor principal.
- Separação entre memórias de projeto e memórias pessoais do usuário.
- Memórias pessoais passam a ser gravadas sem `project_id`, evitando que fiquem presas ao projeto ativo.
- O Context Builder passa a buscar memórias permanentes do usuário mesmo quando existe projeto ativo.
- Perguntas sobre preferências pessoais passam a acionar a regra crítica de uso da memória.

## Arquivos alterados
- `lib/memory/server.ts`

## Não alterado
- CSS global
- Página Memória
- Chat visual
- Login
- Register
- Landing
- Animação do chat

## Teste funcional no site
1. Abrir Chat IA.
2. Enviar: `Gosto de azul.`
3. Perguntar: `Qual minha cor favorita?`

Resultado esperado: a IA deve responder que a cor favorita é azul.

## Validação técnica
- `npx tsc --noEmit`
- Resultado: aprovado.
