# PATCH 029 — Landing PSF Repair

Correção focada na página inicial.

## Arquivos
- `app/page.tsx`
- `app/globals.css`

## Corrige
- Home em texto cru por ausência de estilos `landing-*`.
- Recria landing com linguagem visual inspirada no site PSF.
- Destaca AURA e ARGUS como protagonistas.
- Explica significado funcional dos nomes.
- Usa avatares atuais separados (`aura.webp` e `argus.webp`).
- Mantém efeito Matrix/binary no fundo.
- Não altera dashboard, chat, Supabase, API, login ou banco.

## Validação
- `npm run typecheck` executado com sucesso.
- `next build` compilou, mas o processo local encerrou em `EPIPE` durante coleta de dados por limitação do container; não houve erro de TypeScript ou compilação.
