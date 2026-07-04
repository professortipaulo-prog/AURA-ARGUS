# PATCH 041 — Memory Retrieval + Chat Calibration

## Objetivo
Consolidar a próxima camada do Memory Engine e calibrar o comportamento inicial do chat.

## Alterações

- Recuperação de memórias relevantes usando termos da mensagem do usuário.
- Separação entre memórias relevantes e memórias importantes adicionais.
- Prompt Builder passa a orientar AURA/ARGUS a responder saudações de forma curta.
- Remove respostas automáticas longas quando o usuário apenas chama “AURA”, “ARGUS”, “oi” ou testa o chat.
- Mensagem inicial do chat fica curta e operacional.

## Arquivos alterados

- `app/api/ai/chat/route.ts`
- `app/dashboard/chat/page.tsx`
- `lib/memory/server.ts`
- `lib/memory/types.ts`
- `lib/identity/prompt-builder.ts`

## Banco de dados

Não exige nova migração SQL.

## Observação

Este patch não altera landing, dashboard visual, login, Supabase Auth ou layout aprovado.
