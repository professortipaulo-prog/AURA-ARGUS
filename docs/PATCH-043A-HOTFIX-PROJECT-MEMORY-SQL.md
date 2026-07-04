# PATCH 043A — Hotfix Project Memory SQL

## Motivo

Corrige o erro do Supabase SQL Editor:

```text
ERROR: 42P01: missing FROM-clause entry for table "p_project"
LINE 81: 'name', p_project.name,
```

## Correção aplicada

A função `public.project_json(p_project core.projects)` foi corrigida para acessar campos do argumento composite com sintaxe PostgreSQL segura:

```sql
(p_project).name
```

em vez de:

```sql
p_project.name
```

## Como aplicar

Execute no Supabase SQL Editor:

```text
supabase/migrations/0006_project_memory_hotfix_043a.sql
```

Este arquivo é idempotente e pode ser executado mesmo se o PATCH 043 anterior falhou no meio.

## Depois de aplicar

Teste:

1. Acesse `/dashboard/projects`.
2. Confirme se aparece o projeto padrão.
3. No chat, selecione o projeto.
4. Envie: `Neste projeto, lembre que a decisão foi separar memória por projeto antes do Document Engine.`
5. Pergunte: `Qual foi a decisão deste projeto?`
