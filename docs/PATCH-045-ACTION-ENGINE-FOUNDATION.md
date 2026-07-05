# PATCH 045 — Action Engine Foundation

## Objetivo

Adicionar a primeira camada operacional do AURA/ARGUS: um executor de acoes capaz de listar ferramentas, gerar artefatos simples e disponibilizar download diretamente pelo navegador.

## Escopo implementado

- Tool Registry inicial.
- Action Executor inicial.
- Document Engine Foundation.
- API de capacidades: `GET /api/actions/capabilities`.
- API de execucao: `POST /api/actions/execute`.
- Pagina `/dashboard/actions`.
- Tabelas `core.action_runs` e `core.action_artifacts`.

## Formatos suportados nesta base

- Markdown (`md`)
- HTML (`html`)
- TXT (`txt`)
- CSV (`csv`)
- JSON (`json`)
- SVG (`svg`)
- DOC compativel com Word (`doc`, gerado como HTML)

DOCX, PDF, XLSX e PPTX nativos entram na etapa avancada do Document Engine.

## Arquivos do patch

- `app/api/actions/capabilities/route.ts`
- `app/api/actions/execute/route.ts`
- `app/dashboard/actions/page.tsx`
- `lib/actions/types.ts`
- `lib/actions/capabilities.ts`
- `lib/actions/document-engine.ts`
- `lib/actions/server.ts`
- `supabase/migrations/0007_action_engine.sql`

## SQL

Executar no Supabase:

```sql
supabase/migrations/0007_action_engine.sql
```

## Testes recomendados

1. Abrir `/api/actions/capabilities`.
2. Confirmar retorno com `document.create` ativo.
3. Rodar SQL no Supabase.
4. Abrir `/dashboard/actions`.
5. Gerar um documento Markdown.
6. Baixar o arquivo.
7. Gerar um SVG.
8. Baixar e abrir o SVG no navegador.

## Observacao

Este patch nao altera landing, chat, login, AI Router, Identity Engine ou Project Memory.
