# PATCH 045T — UI Recovery + Action Engine Stabilization

Correção emergencial após regressão visual da Landing e interferência visual do Project Memory no Chat.

## O que corrige

- Restaura a Landing Page aprovada.
- Mantém o Action Engine operacional.
- Remove do Chat a faixa visível de projeto ativo.
- Mantém o contexto de projeto de forma interna.
- Preserva o tema Matrix, sidebar e layout aprovado.
- Não altera banco, AI Router, Identity, Memory ou Supabase.

## Arquivos

- app/page.tsx
- app/globals.css
- app/dashboard/chat/page.tsx
- app/dashboard/actions/page.tsx
- app/api/actions/capabilities/route.ts
- app/api/actions/execute/route.ts
- lib/actions/*
- supabase/migrations/0007_action_engine.sql

## Teste

1. Abrir `/` e confirmar Landing visual.
2. Abrir `/dashboard/chat` e confirmar que não aparece a faixa `Projeto ativo`.
3. Abrir `/dashboard/actions`.
4. Gerar Markdown e baixar.
5. Gerar SVG e abrir no navegador.
