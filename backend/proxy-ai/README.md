# Backend: Proxy de IA

Estrutura do proxy seguro entre o frontend e os provedores de IA
(Gemini/Anthropic), conforme `COM-002_Arquitetura_Geral` e
`Sprint-002.md` (AI Router).

## Status — Sprint 004

- [x] Estrutura de orquestração (`handleProxyRequest` → AI Router).
- [x] Nenhuma chave de API exposta ou lida no frontend.
- [ ] Chamada HTTP real a Gemini/Anthropic — fora de escopo.
- [ ] Deploy como Supabase Edge Function — pendente.

## Pendências técnicas

- Adaptar para `Deno.serve` ao migrar para Supabase Edge Functions.
- Ler `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` somente em runtime de
  servidor (nunca em `NEXT_PUBLIC_*`).
- Adicionar rate limiting e validação de sessão antes de rotear.
