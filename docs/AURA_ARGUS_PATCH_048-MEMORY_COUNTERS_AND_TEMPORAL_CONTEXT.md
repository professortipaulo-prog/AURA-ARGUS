# AURA_ARGUS_PATCH_048 - MEMORY_COUNTERS_AND_TEMPORAL_CONTEXT

## Objetivo
Estabilizar a etapa seguinte do Memory Engine sem criar módulos novos: contadores reais, recuperação de memória por fallback e contexto temporal obrigatório no prompt de AURA/ARGUS.

## Problemas corrigidos
- AURA/ARGUS podiam responder data/hora incorreta por ausência de contexto temporal explícito.
- A página Memória dependia exclusivamente da função RPC `get_memory_engine_status`.
- A recuperação de memória dependia exclusivamente das RPCs `get_project_memory_context` e `get_memory_context`.
- Projetos podiam exibir contadores zerados se a RPC de listagem não retornasse os agregados corretamente.

## Arquivos alterados
- `lib/identity/prompt-builder.ts`
- `lib/memory/server.ts`
- `lib/projects/server.ts`

## Alterações realizadas
- Inserido bloco `CONTEXTO TEMPORAL OBRIGATÓRIO` no prompt final das personas.
- Timezone padrão definido como `America/Bahia`, com suporte opcional a `AURA_ARGUS_TIMEZONE`.
- Criado fallback direto para recuperar memórias, sessões e projeto ativo nas tabelas `core.memory_items`, `core.memory_sessions` e `core.projects`.
- Criado fallback direto para status da memória quando a RPC falhar.
- Projetos agora recalculam `memoryCount`, `sessionCount` e `lastActivityAt` com base nas tabelas reais de memória.

## Impacto esperado
- Perguntas como “Qual data é hoje e quantas horas faltam para terminar o dia?” passam a usar o horário atual do servidor no timezone oficial.
- Após conversas no chat, Memória deve mostrar sessões/mensagens/memórias reais.
- Projetos deve refletir conversas e memórias associadas ao projeto ativo.
- Se alguma RPC do Supabase falhar, a aplicação tenta consultar diretamente as tabelas antes de retornar erro.

## Compatibilidade
Patch compatível com PATCH 046 e PATCH 047.
Não altera landing page.
Não altera visual aprovado do chat.
Não cria novo módulo.

## Teste funcional direto no site
1. Publicar o patch na Vercel.
2. Entrar no site.
3. Abrir Chat IA.
4. Perguntar: `Qual data é hoje e quantas horas faltam para terminar o dia?`
5. Testar com AURA e ARGUS.
6. Enviar: `Neste projeto, a próxima etapa é concluir o Action Engine operacional.`
7. Perguntar: `Qual é a próxima etapa deste projeto?`
8. Abrir Projetos e verificar se os contadores saíram de zero.
9. Abrir Memória e verificar se Sessões, Mensagens e Memórias saíram de zero.

## Validação técnica
- `npx tsc --noEmit`: aprovado.
- `npm run build`: aprovado.

## Status
Pronto para envio ao GitHub.
