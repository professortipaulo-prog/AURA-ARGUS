# PATCH 031 — Landing PSF CSS Restore

Correção exclusiva da tela inicial antes do login.

## Arquivos
- app/globals.css

## Escopo
- Não altera chat.
- Não altera dashboard.
- Não altera login.
- Não altera Supabase/API.

## Correção
Adiciona novamente os estilos das classes `landing-*` usadas por `app/page.tsx`, evitando que a home apareça como texto cru.
