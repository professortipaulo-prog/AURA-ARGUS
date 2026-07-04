# PATCH 040 — Identity Engine

Implementa a camada de identidade interpretada do AURA/ARGUS.

## Arquivos

- `app/api/ai/chat/route.ts`
- `app/api/identity/context/route.ts`
- `app/api/identity/profile/route.ts`
- `app/dashboard/identity/page.tsx`
- `lib/identity/identity-engine.ts`
- `lib/identity/personality-builder.ts`
- `lib/identity/context-builder.ts`
- `lib/identity/prompt-builder.ts`
- `lib/identity/types.ts`
- `lib/identity/server.ts`
- `lib/identity/engine.ts`
- `supabase/migrations/0005_identity_engine.sql`

## Supabase

Execute:

```sql
supabase/migrations/0005_identity_engine.sql
```

## O que muda

- AURA e ARGUS passam a receber identidade interpretada, não apenas JSON bruto.
- AURA usa postura estratégica, produtiva e organizadora.
- ARGUS usa postura operacional, técnica e supervisora.
- O chat usa o `Prompt Builder` do Identity Engine.
- Nova tabela `core.identity_profiles` registra snapshots de identidade.

## Não altera

- Landing Page
- Login
- Layout do Chat
- Dashboard visual
- Supabase Auth
- Providers de IA
