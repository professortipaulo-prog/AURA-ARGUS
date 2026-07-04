# PATCH 043 — Project Memory

## Objetivo
Adicionar memória por projeto ao AURA/ARGUS, isolando conversas, decisões e memórias por contexto de trabalho.

## Arquivos alterados/criados

- `app/api/ai/chat/route.ts`
- `app/api/projects/route.ts`
- `app/dashboard/chat/page.tsx`
- `app/dashboard/projects/page.tsx`
- `lib/ai/types.ts`
- `lib/memory/server.ts`
- `lib/memory/types.ts`
- `lib/projects/server.ts`
- `lib/projects/types.ts`
- `app/globals.css`
- `supabase/migrations/0006_project_memory.sql`

## O que muda

- Cria a tabela `core.projects`.
- Adiciona `project_id` em sessões e memórias.
- Cria `core.project_timeline`.
- Cria RPCs públicas seguras para listar/criar projetos.
- Cria RPC para recuperar memória contextual do projeto ativo.
- Adiciona seletor de projeto no chat.
- Cada mensagem enviada passa a carregar `projectId`.
- As respostas usam prioridade de contexto:
  1. memória do projeto ativo;
  2. memória permanente do usuário;
  3. conversa atual;
  4. conhecimento geral.

## Instalação

1. Subir os arquivos do patch.
2. Executar no Supabase SQL Editor:

```sql
supabase/migrations/0006_project_memory.sql
```

## Teste recomendado

1. Acesse `/dashboard/projects`.
2. Confirme que existe o projeto padrão `AURA/ARGUS AI Operating System`.
3. Acesse `/dashboard/chat`.
4. Selecione o projeto padrão.
5. Envie:

> Neste projeto, lembre que a decisão principal foi separar memória por projeto antes do Document Engine.

6. Crie outro projeto pelo seletor do chat.
7. Converse sobre outro tema.
8. Volte ao projeto AURA/ARGUS e pergunte:

> Qual foi a última decisão importante deste projeto?

Resultado esperado: AURA/ARGUS deve recuperar a decisão do projeto ativo sem misturar com o outro projeto.
