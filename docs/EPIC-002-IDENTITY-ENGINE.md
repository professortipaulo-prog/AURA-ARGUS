# EPIC 002 — Identity Engine

## Entrega

Transforma o Profile Engine em uma identidade operacional consumida automaticamente por AURA e ARGUS.

## Arquivos

- `lib/identity/engine.ts`
- `lib/identity/server.ts`
- `app/api/identity/route.ts`
- `app/dashboard/identity/page.tsx`
- `components/layout/sidebar.tsx`
- `app/api/ai/chat/route.ts`
- `lib/ai/types.ts`
- `lib/ai/ai-router.ts`
- `lib/ai/providers/anthropic.ts`
- `lib/ai/providers/gemini.ts`

## Resultado

- Não há novo formulário.
- O perfil preenchido vira identidade digital.
- AURA e ARGUS recebem instruções diferentes automaticamente.
- O chat passa a receber contexto do usuário sem exibir JSON cru.
- Nova tela: `/dashboard/identity`.
- Nova API: `/api/identity`.

## Validação

1. Acesse `/dashboard/identity`.
2. Verifique resumo, sinais, lacunas e instruções de AURA/ARGUS.
3. Acesse `/dashboard/chat`.
4. Pergunte algo pessoal/profissional.
5. A resposta deve considerar o perfil salvo.
