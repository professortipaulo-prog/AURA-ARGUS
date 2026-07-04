# PATCH 043B — Hotfix Project Memory Schema Compat

Corrige compatibilidade com bancos onde `core.projects` já existia com `title/context`, mas sem `name/metadata/color/icon`.

## Aplicar
Execute no Supabase SQL Editor:

`supabase/migrations/0006_project_memory_hotfix_043b.sql`

## Teste
1. Acesse `/dashboard/projects`.
2. Confirme se o projeto padrão aparece.
3. Use o chat com projeto selecionado.
