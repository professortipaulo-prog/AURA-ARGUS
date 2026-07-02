# Sprint 006 — AI Provider Setup (conectado ao chat real)

**Objetivo:** conectar o chat do dashboard a Anthropic e Gemini de
verdade, sem quebrar nada do que já existia.

## Entregue

| # | Item | Arquivo |
| --- | --- | --- |
| 1 | Adapter Anthropic | `lib/ai/providers/anthropic.ts` |
| 2 | Adapter Gemini | `lib/ai/providers/gemini.ts` |
| 3 | Roteador de conexão real | `lib/ai/ai-router.ts` |
| 4 | Tipos | `lib/ai/types.ts` |
| 5 | Rota de chat | `app/api/ai/chat/route.ts` |
| 6 | Rota de status | `app/api/ai/status/route.ts` |
| 7 | `.env.example` atualizado | variáveis novas mescladas com as existentes |
| 8 | Chat da UI conectado | `app/dashboard/chat/page.tsx` chama `/api/ai/chat` de verdade |
| 9 | `/api/health` | mantido sem alteração |
| 10 | `/api/supabase-test` | mantido sem alteração |

## Validado

```
npm run typecheck   → 0 erros
npm run build         → ✓ compilado, /api/ai/chat e /api/ai/status presentes
next start + curl (sem chaves configuradas, cenário mais restritivo):
  GET  /api/ai/status  → providers: [{configured:false}, {configured:false}] — sem expor chaves
  POST /api/ai/chat    → 503 "provedor não está configurado"
  GET  /api/health     → intacto
```

## Como a UI se comporta

- Botão **AURA** → chama Anthropic. Botão **ARGUS** → chama Gemini.
  (Escolha de demonstração — qualquer persona funciona com qualquer provedor.)
- Se a chave não estiver na Vercel: aparece um aviso amarelo com o erro
  real da API, não uma resposta inventada.
- Se funcionar: a resposta da IA aparece como mensagem, e o avatar
  anima (pensando → falando → repouso) de acordo com o ciclo real da
  requisição — não é mais um timer fixo como antes.

## Variáveis necessárias na Vercel

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
DEFAULT_AI_PROVIDER=anthropic
DEFAULT_AI_MODEL=claude-3-5-sonnet-latest
GEMINI_DEFAULT_MODEL=gemini-1.5-pro
```

## Pendências

- Unificar com a política estrutural de `modules/ai-router` (Sprint 004).
- Persistir histórico de conversa (`modules/conversation` + Supabase).
- Rate limiting / autenticação antes de permitir chamadas a `/api/ai/chat`.
- Streaming de resposta (hoje a resposta chega inteira, não token a token).

Entrega finalizada. Aguardando revisão.
