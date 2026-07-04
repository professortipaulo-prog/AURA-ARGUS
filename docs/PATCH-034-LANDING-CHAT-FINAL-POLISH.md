# PATCH 034 — Landing PSF + Chat Final Polish

Escopo restrito:
- `app/page.tsx`
- `app/globals.css`

Correções:
- Restaura completamente o visual da landing inspirado no site PSF.
- Reativa layout, cards, botões, anagrama, avatares, fundo tecnológico e Matrix.
- Mantém a página inicial com destaque para AURA e ARGUS e seus significados.
- Aumenta verticalmente a caixa de texto do chat.
- Mantém o chat atual sem alterar lógica, API, Supabase, login ou dashboard.

Validação local:
- `npm run typecheck` passou.
- `next build` compilou com sucesso antes do timeout na geração estática do ambiente local.
