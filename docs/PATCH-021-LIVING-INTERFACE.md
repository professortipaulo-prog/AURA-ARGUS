# PATCH 021 — Living Interface

## Entrega
- Remove botões internos desnecessários do header.
- Mantém apenas o alternador de tema/persona.
- Tema AURA: lilás claro, binários rosados/lilás e fundo suave.
- Tema ARGUS: escuro, binários azuis/ciano e fundo operacional.
- Fundo animado global no dashboard.
- Chat envia com Enter e quebra linha com Shift + Enter.
- Alternar AURA/ARGUS muda a identidade visual geral.
- Avatar com estado visual: idle, thinking, speaking, listening.
- Avatar com pseudo-movimento de respiração, olhos, boca, HUD e barras de fala.

## Arquivos
- app/dashboard/layout.tsx
- app/dashboard/chat/page.tsx
- app/globals.css
- components/layout/header.tsx
- components/theme-toggle.tsx
- components/avatar-panel.tsx
- components/living-background.tsx

## Validação
npm run build: aprovado.
