# PATCH 038 — Dashboard Density Responsive

Escopo do patch:

- `app/globals.css`
- `app/dashboard/chat/page.tsx`

## Ajustes principais

- Recalibra a escala geral do dashboard para funcionar melhor em 1920x1080 com zoom 100%.
- Remove o `overflow: hidden` global que cortava páginas como Central de Operações e Perfil.
- Compacta sidebar, header, métricas, cards e formulários das páginas internas.
- Mantém o Chat como referência visual aprovada.
- Amplia a área útil da conversa no Chat.
- Reduz o campo de digitação vazio e permite expansão automática conforme o conteúdo.
- Mantém Matrix, cores, neon, AURA/ARGUS e comportamento atual.

## O que não altera

- Landing page.
- Login.
- APIs.
- Supabase.
- Banco de dados.
- Fluxo de autenticação.
