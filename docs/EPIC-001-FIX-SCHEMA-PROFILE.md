# EPIC-001 — Fix Schema Profile Engine

Corrige a migration RPC do Profile Engine para bancos onde `core.user_profile_intelligence` ja havia sido criada pela migration 0002 com colunas separadas (`personal`, `professional`, etc.) e sem `profile_data`.

## Arquivo

- `supabase/migrations/0003_profile_engine_rpc.sql`

## Correções

- Adiciona `profile_data` quando a tabela ja existe.
- Mantem compatibilidade com as colunas antigas.
- Recria `get_user_profile_intelligence`.
- Recria `upsert_user_profile_intelligence`.
- Atualiza `core.profiles` antes de salvar dados complementares.
