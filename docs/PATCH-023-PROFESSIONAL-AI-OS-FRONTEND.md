# PATCH 023 — Professional AI OS Frontend

Entrega visual completa para AURA/ARGUS com base na skin aprovada.

## Implementado

- Novo dashboard “Central de Operações”.
- Novo chat AI OS com layout premium.
- Tema AURA em violeta escuro/neon.
- Tema ARGUS em azul/ciano escuro.
- Efeito Matrix/binários animados em Canvas.
- Sidebar restaurada, legível e com destaque premium.
- Header limpo: sem “Olá Paulo”, sem data/hora, sem botões redundantes.
- Login redesenhado em padrão PSF escuro tecnológico.
- Avatares preservados e sem corte agressivo.
- Movimento visual nos avatares: halo, respiração, piscar simulado, boca/onda em estado speaking.
- Chat envia com Enter e quebra linha com Shift+Enter.
- AURA e ARGUS enviam prompt de identidade próprio, sem responder como Claude/Gemini.

## Arquivos alterados

- app/globals.css
- app/layout.tsx
- app/login/page.tsx
- app/dashboard/layout.tsx
- app/dashboard/page.tsx
- app/dashboard/chat/page.tsx
- components/avatar-panel.tsx
- components/living-background.tsx
- components/layout/header.tsx
- components/layout/sidebar.tsx
- components/theme-toggle.tsx

## Validação

`npm run build` executado com sucesso.
