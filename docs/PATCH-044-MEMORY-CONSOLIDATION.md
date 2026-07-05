# PATCH 044 — Memory Consolidation Engine

## Objetivo
Fechar o ciclo real da memória do AURA/ARGUS: gravar decisões, próximas etapas e preferências relevantes automaticamente e recuperar esse contexto antes da resposta.

## Alterações
- Reescrita do `lib/memory/server.ts`.
- `getMemoryContext` passa a priorizar memória do projeto ativo/default.
- `buildMemoryPrompt` fica mais forte para perguntas como “qual é a próxima etapa?” e “onde paramos?”.
- `saveChatTurn` registra memórias automáticas com classificação básica.
- Nova migration `0008_memory_consolidation.sql` corrige a RPC `get_project_memory_context` e compatibiliza projetos `title/name`.

## Teste pelo site
1. Entrar no site.
2. Abrir Chat IA.
3. Enviar: `Neste projeto, a próxima etapa é concluir o Action Engine operacional.`
4. Em seguida perguntar: `Qual é a próxima etapa deste projeto?`
5. Resultado esperado: AURA/ARGUS deve responder que a próxima etapa é concluir o Action Engine operacional.
6. Fechar o navegador, entrar novamente e perguntar: `Onde paramos neste projeto?`
