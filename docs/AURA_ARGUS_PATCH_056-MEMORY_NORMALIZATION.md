# AURA_ARGUS_PATCH_056 - MEMORY_NORMALIZATION

## Objetivo
Normalizar a gravação e recuperação de memórias para evitar que perguntas ou registros corrompidos sejam salvos e reutilizados como fatos do projeto.

## Problemas corrigidos
- Perguntas como "Qual é a próxima etapa?" podiam virar memória permanente.
- Registros corrompidos como "A próxima etapa deste projeto é deste projeto?" apareciam no contexto da AURA.
- Memórias locais do chat podiam manter fatos inválidos e contaminar o resumo da arquitetura.

## Arquivos alterados
- `lib/memory/server.ts`
- `app/dashboard/chat/page.tsx`

## Alterações realizadas
- Inclusão de filtros para detectar perguntas antes de salvar memória.
- Inclusão de filtro para descartar memórias corrompidas na leitura do Memory Engine.
- Normalização de fatos extraídos antes de persistir no Supabase.
- Proteção equivalente na memória local usada pelo chat.

## Impacto esperado
- AURA e ARGUS deixam de usar perguntas como se fossem fatos.
- O registro inconsistente da próxima etapa deixa de aparecer no contexto.
- O contexto recuperado fica mais limpo e confiável.

## Teste funcional direto no site
1. Abra o Chat IA.
2. Envie: `A próxima etapa deste projeto é concluir o Action Engine operacional.`
3. Pergunte: `Qual é a próxima etapa deste projeto?`
4. A resposta deve mencionar: `concluir o Action Engine operacional`.
5. Pergunte: `Resuma toda a arquitetura do projeto.`
6. A resposta não deve exibir frases corrompidas como `A próxima etapa deste projeto é deste projeto?`.

## Validação técnica
- `npx tsc --noEmit`: aprovado.
- `npm run build` compilou e gerou páginas, mas no ambiente local encerrou por timeout/EPIPE na etapa final de traces. Não houve erro de TypeScript ou compilação antes do timeout.

## Status
Pronto para deploy controlado.
