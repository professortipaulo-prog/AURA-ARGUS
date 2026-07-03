# EPIC-001 FIX — Profile Engine

## Correções

- Remove a exposição visual de `user_context.json`.
- Substitui por um painel de resumo inteligente.
- Remove DISC como campo obrigatório/manual.
- Melhora objetivos, rotina, ferramentas, conhecimentos e preferências da IA.
- Corrige o cálculo de conclusão.
- Corrige o erro `Invalid schema: core` usando funções RPC públicas com `security definer`.

## SQL obrigatório

Rodar no Supabase SQL Editor:

```sql
supabase/migrations/0003_profile_engine_rpc.sql
```

## Rota

- `/dashboard/profile`
- `/api/profile`

