# PATCH 022 — Design PSF AURA/ARGUS

## Entrega
- Login redesenhado no padrão escuro tecnológico PSF.
- Remove botões internos desnecessários do header do dashboard.
- Header passa a exibir apenas status online e seletor de tema.
- AURA deixa de usar tema claro estourado; passa a usar tema violeta premium escuro.
- ARGUS mantém tema escuro azul/ciano.
- Adiciona background animado com binários, grid e orbs.
- Chat com Enter para enviar e Shift+Enter para quebrar linha.
- Chat recebe persona AURA/ARGUS no payload.

## Arquivos
- app/globals.css
- app/login/page.tsx
- app/dashboard/page.tsx
- app/dashboard/chat/page.tsx
- components/layout/header.tsx
- components/living-background.tsx

## Validação
`npm run build` aprovado.
