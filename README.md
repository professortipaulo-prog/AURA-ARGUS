# AURA / ARGUS

Assistente profissional inteligente com voz, texto, avatar, memória e
executor de ações — projeto PSF Editora e Consultoria.

**Sprint entregue:** CLAUDE-004 — Núcleo de Inteligência (Core Intelligence)
**Papel:** Lead Software Engineer (Claude), sob arquitetura aprovada
pelo Chief AI Architect.

## Stack oficial (não alterar sem aprovação)

- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: Supabase Edge Functions
- Banco: Supabase PostgreSQL
- IA: Gemini ou Anthropic via backend/proxy seguro
- Voz: Web Speech API
- Câmera: getUserMedia
- Reconhecimento facial: face-api.js
- Deploy futuro: Vercel

## Como executar localmente

```bash
npm install
cp .env.example .env.local   # preencher com valores de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`. A tela inicial é um placeholder —
o conteúdo desta sprint está na camada de módulos (`/modules`), não na UI.

```bash
npm run typecheck   # verificação de tipos de todos os módulos
npm run lint        # lint do projeto
```

## Estrutura do projeto

```
app/                     Next.js App Router (tela placeholder)
components/               Componentes de UI reutilizáveis (vazio nesta sprint)
modules/
  ai-router/              Roteamento Gemini/Anthropic, fallback, timeouts
  conversation/            Conversation Manager — histórico e sessão
  context-builder/          Context Builder — contexto usuário/projeto/conversa
  prompt-builder/            Prompt Builder — System/Context/User prompt
  memory/                     Memory Retrieval — memória persistente + embeddings (estrutura)
  personality/                Personality Engine — personas AURA/ARGUS, DISC
  workflow/                    Workflow Engine — planejamento/execução/monitoramento
  avatar/ voice/ camera/ auth/
  actions/ documents/ knowledge-hub/ faceid/   Placeholders (fora de escopo nesta sprint)
backend/proxy-ai/         Estrutura do proxy seguro de IA (sem chamadas reais)
supabase/                 Reservado para migrações SQL futuras
lib/                      Utilitários compartilhados (env.ts separa client/server)
types/                    Tipos globais de aplicação
hooks/                    Hooks globais (fora de módulo específico)
docs/                     Relatório da sprint e diagramas
```

Cada módulo em `modules/*` segue o padrão obrigatório definido pelo
Chief AI Architect: `types.ts`, `interfaces.ts`, `service.ts`,
`repository.ts`, `controller.ts`, `hooks.ts`, `utils.ts`,
`constants.ts`, `index.ts`, `README.md`.

## O que foi implementado nesta sprint (CLAUDE-004)

- Núcleo de Inteligência completo em estrutura: AI Router, Conversation
  Manager, Context Builder, Prompt Builder, Memory Retrieval,
  Personality Engine e Workflow Engine.
- Nenhuma chamada real a Gemini ou Anthropic.
- Nenhuma chave de API no frontend (ver `lib/env.ts` e `.env.example`).

## O que NÃO foi implementado (fora de escopo)

- Conexão real com Gemini/Anthropic.
- FaceID, voz e câmera reais.
- Integrações externas reais (Google, Microsoft, WhatsApp, GitHub, NotebookLM).
- Persistência real em Supabase (todos os repositórios desta sprint são em memória).

## Variáveis de ambiente (`.env.example`)

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Uso exclusivo de backend |
| `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` | Uso exclusivo de backend — não conectadas nesta sprint |
| `AI_ROUTER_*` | Provedor padrão/fallback e timeouts do AI Router |
| `VECTOR_DB_*` | Reservado para banco vetorial futuro (Memory Retrieval) |

## Pendências Técnicas

Ver detalhamento completo em `docs/SPRINT-004-REPORT.md`. Resumo:

- Implementar `IAIProviderAdapter` real para Gemini e Anthropic (único
  ponto de extensão necessário no AI Router).
- Substituir todos os repositórios em memória por Supabase.
- Conectar Memory Retrieval a um banco vetorial (pgvector) real.
- Implementar o Action Manager (Sprint-002 §5) consumindo o Workflow
  Engine para execução real de ações.

## Próximos passos sugeridos

1. Revisão do Chief AI Architect sobre esta sprint.
2. Especificação do Action Manager real (integrações Google/Microsoft/WhatsApp/GitHub).
3. Conexão efetiva do AI Router a Gemini e Anthropic.
4. Migração dos repositórios em memória para Supabase (schema em `supabase/README.md`).

---
Entrega finalizada. Aguardando revisão do Chief AI Architect.
