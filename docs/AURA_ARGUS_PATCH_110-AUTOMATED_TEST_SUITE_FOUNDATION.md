# AURA_ARGUS_PATCH_110 — AUTOMATED_TEST_SUITE_FOUNDATION

## Objetivo
Endereçar a maior dívida técnica registrada no Documento Mestre:
validação hoje depende só de `typecheck` + `build` + teste manual. Este
patch introduz testes automatizados reais para a lógica mais crítica já
construída, começando pelas funções que eu já testava manualmente (via
scripts descartáveis) em quase todo patch desta sessão.

## Framework escolhido
**Vitest** — leve, rápido, integra bem com TypeScript sem configuração
extra. Não incluí `@vitejs/plugin-react` (testes de componente React)
nesta primeira etapa — os testes atuais cobrem só lógica pura de
servidor, que é onde os bugs mais graves desta sessão aconteceram.

## O que foi testado (19 testes, 5 arquivos)

### `lib/avatar/expression.test.ts` (3 testes)
Classificação de tom da resposta da IA (talking/smiling/serious) —
PATCH_102.

### `lib/actions/chat-document-intent.test.ts` (5 testes)
Detecção de pedido de documento no chat, incluindo os 4 formatos e 2
casos negativos (perguntas normais não devem disparar) — PATCH_106.

### `lib/actions/chat-border-choice.test.ts` (4 testes)
Detecção da escolha de borda por nome ou número — PATCH_108.

### `lib/face/server.test.ts` (3 testes)
A matemática de comparação facial (distância euclidiana) — mesmo
rosto/diferente/idêntico — PATCH_099/104.

### `lib/memory/server.test.ts` (4 testes)
**O mais importante**: teste de regressão do bug histórico do
PATCH_066 (extração de preferência de cor falhava com pontuação no
final da frase, ex: "Gosto de azul."). Se essa lógica quebrar de novo no
futuro — por qualquer patch, mesmo sem querer — o teste falha
imediatamente, sem depender de alguém notar em produção.

## Arquivos novos
- `vitest.config.ts`
- `lib/avatar/expression.test.ts`
- `lib/actions/chat-document-intent.test.ts`
- `lib/actions/chat-border-choice.test.ts`
- `lib/face/server.test.ts`
- `lib/memory/server.test.ts`

## Arquivos alterados
- `package.json` (dependência `vitest`, novo script `npm run test`)
- `lib/face/server.ts` (`euclideanDistance` passou a ser exportada, só
  para poder ser testada diretamente — nenhuma mudança de comportamento)
- `lib/memory/server.ts` (`extractMemoryCandidate` passou a ser
  exportada, mesmo motivo — nenhuma mudança de comportamento)

## O que NÃO foi alterado
- Nenhuma lógica de negócio — só exportação de 2 funções que já existiam
  internamente, para permitir teste direto.
- Nenhuma outra página ou funcionalidade.

## Validação executada
```
npm run test         # 19 testes, todos passando, 5 arquivos
npm run typecheck    # 0 erros
npm run build          # build completo
```

## Como rodar os testes (para você, no seu ambiente)
```
npm run test
```
Roda uma vez e mostra o resultado. Recomendo rodar isso antes de cada
deploy, junto com `typecheck` e `build` — os três juntos cobrem bem mais
terreno do que só os dois de antes.

## Próximos passos possíveis (não feitos agora)
- Testes de componente React (precisa de `@vitejs/plugin-react` — teve
  conflito de versão com o Vitest instalado; resolver depois se for
  prioridade).
- Testes de integração com banco de dados real (hoje só testamos lógica
  pura, sem tocar no Supabase).
- Rodar os testes automaticamente a cada push (CI/CD via GitHub Actions)
  — hoje é manual.

## Status
Implementado e validado. Primeira base real de testes automatizados do
projeto, cobrindo os pontos de maior risco histórico.
