# AURA_ARGUS_PATCH_049 - HOTFIX_CHAT_MEMORY_EXPORTS

## Objetivo
Corrigir a falha de build da Vercel causada por exports ausentes em `lib/memory/server.ts` usados por `app/api/ai/chat/route.ts`.

## Erro corrigido
A Vercel acusava ausência dos seguintes exports:

- `buildTemporalContext`
- `getOrCreateActiveProject`
- `getProjectMemoryContext`
- `temporalPromptBlock`
- `memoryPromptBlock`
- `persistChatTurn`

## Arquivo alterado
- `lib/memory/server.ts`

## Alterações realizadas
- Restaurados exports de compatibilidade usados pela rota do Chat IA.
- Mantido o contexto temporal obrigatório no prompt.
- Mantida a recuperação de memória do projeto antes da resposta.
- Mantida a persistência das conversas por meio do fluxo existente de memória.
- Restaurados também `getMemoryOverview` e `formatLastActivity`, usados pelas páginas de Memória e Projetos.

## Escopo preservado
- Não altera landing page.
- Não altera visual do chat.
- Não altera CSS global.
- Não cria novo módulo.

## Validação local
Executado:

```bash
npx tsc --noEmit
```

Resultado: aprovado, sem erro de TypeScript.

O `npm run build` chegou a compilar e passou para a etapa de validação, mas o ambiente local encerrou por tempo. O erro específico da Vercel, que era export ausente, foi corrigido pelo `tsc`.

## Teste direto no site após deploy
1. Abrir o site.
2. Abrir Chat IA.
3. Perguntar: `Qual data é hoje e quantas horas faltam para terminar o dia?`
4. Verificar AURA e ARGUS com data/hora correta.
5. Enviar: `Neste projeto, a próxima etapa é concluir o Action Engine operacional.`
6. Perguntar: `Qual é a próxima etapa deste projeto?`
7. Abrir Memória e Projetos.
8. Verificar se os contadores começam a sair de zero após conversas.
