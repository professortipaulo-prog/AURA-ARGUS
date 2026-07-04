# PATCH 039 — EPIC 003 — Memory Engine Foundation

## Objetivo
Adicionar a primeira camada real de memória do AURA/ARGUS sem alterar a interface visual aprovada.

## Arquivos alterados

- `app/api/ai/chat/route.ts`
- `app/api/memory/context/route.ts`
- `app/api/memory/sessions/route.ts`
- `app/dashboard/chat/page.tsx`
- `app/dashboard/memory/page.tsx`
- `lib/ai/types.ts`
- `lib/memory/server.ts`
- `lib/memory/types.ts`
- `supabase/migrations/0004_memory_engine.sql`

## O que foi implementado

- Tabelas de sessões de memória.
- Tabelas de mensagens por conversa.
- Tabela de memórias persistentes do usuário.
- RLS por usuário autenticado.
- RPC `get_memory_context`.
- Registro automático de cada turno do chat.
- Recuperação de contexto antes de chamar AURA ou ARGUS.
- `sessionId` retornado para manter continuidade da conversa.
- Página Memória com estatísticas reais quando a migração estiver aplicada.

## Como aplicar

1. Subir os arquivos do patch no GitHub.
2. Rodar no Supabase SQL Editor:

```sql
supabase/migrations/0004_memory_engine.sql
```

3. Fazer deploy na Vercel.
4. Testar no chat:
   - enviar mensagem;
   - verificar se `memory_sessions` e `memory_messages` recebem registros;
   - abrir `/dashboard/memory`.

## Observação
Este patch não altera Landing Page, Login, Dashboard visual, APIs de IA existentes, chaves da Vercel ou banco já existente além da nova migração.
