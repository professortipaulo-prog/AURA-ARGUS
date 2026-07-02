# AURA / ARGUS

Assistente profissional inteligente com voz, texto, avatar, memória e
executor de ações — projeto PSF Editora e Consultoria.

**Papel:** Lead Software Engineer (Claude), implementando o MVP
modular sobre a arquitetura já aprovada, sem alterar stack ou escopo.

## Stack oficial — não alterar sem aprovação

- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: Supabase Edge Functions
- Banco: Supabase PostgreSQL
- IA: Gemini ou Anthropic via backend/proxy seguro
- Voz: Web Speech API
- Câmera: getUserMedia
- Reconhecimento facial: face-api.js
- Deploy: Vercel (ou hospedagem compatível com Next.js)

## Como executar localmente

```bash
npm install
cp .env.example .env.local   # preencher com valores de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

```bash
npm run typecheck   # verificação de tipos de todo o projeto
npm run lint         # lint do projeto
npm run build         # build de produção (usado também no deploy Vercel)
```

## Estrutura do projeto

```
app/
  page.tsx                Tela inicial (landing)
  layout.tsx                Layout raiz + script anti-flash do tema
  login/ register/           Telas de autenticação (visual, sem lógica real)
  dashboard/
    layout.tsx               Layout do painel (sidebar + conteúdo)
    page.tsx                  Dashboard base
    chat/page.tsx              Chat placeholder + avatar placeholder
    projects/ documents/ memory/ agents/ settings/ admin/   Telas base do painel
  api/health/                Rota de verificação de saúde
  api/supabase-test/          Rota de teste de conexão com Supabase
components/
  layout/header.tsx          Cabeçalho do painel (inclui botão de tema)
  layout/sidebar.tsx          Navegação lateral do painel
  theme-toggle.tsx             Botão de tema claro/escuro
  avatar-panel.tsx              Avatar placeholder (AURA/ARGUS)
  brand/logo-mark.tsx            Logo SVG + wordmark (identidade visual)
  ui/                            Componentes reutilizáveis (Button, Card, Badge, Input, StatCard, EmptyState)
modules/
  ai-router/ conversation/ context-builder/ prompt-builder/
  memory/ personality/ workflow/            Núcleo de Inteligência (estrutura completa, sem chamadas reais)
  avatar/ voice/ camera/ auth/
  actions/ documents/ knowledge-hub/ faceid/  Módulos vazios (placeholder estrutural, fora de escopo ainda)
backend/proxy-ai/          Estrutura do proxy seguro de IA (sem chave real, sem chamadas reais)
lib/
  env.ts                    Leitura centralizada de variáveis de ambiente (separa client/server)
  supabase/                  Clientes Supabase (browser, server, admin)
  auth/session.ts             Sessão (estrutura)
supabase/                  Migrações SQL e schema do banco
database/                  Script SQL de referência da arquitetura de dados
types/                     Tipos globais de aplicação
hooks/                      Hooks globais (fora de módulo específico)
docs/                       Relatórios técnicos das sprints e diagramas
```

Cada módulo em `modules/*` segue o padrão obrigatório definido pela
arquitetura: `types.ts`, `interfaces.ts`, `service.ts`,
`repository.ts`, `controller.ts`, `hooks.ts`, `utils.ts`,
`constants.ts`, `index.ts`, `README.md`. Módulos ainda vazios
(`avatar`, `voice`, `camera`, `auth`, `actions`, `documents`,
`knowledge-hub`, `faceid`) têm apenas `index.ts` e `README.md`,
mantendo a estrutura de pastas prevista na arquitetura sem lógica
implementada.

## O que existe hoje no projeto

- **Núcleo de Inteligência** (`modules/ai-router`, `conversation`,
  `context-builder`, `prompt-builder`, `memory`, `personality`,
  `workflow`) — estrutura completa, sem chamadas reais a Gemini/Anthropic.
- **Dashboard base** (`app/dashboard/*`) — layout, navegação lateral,
  cabeçalho, telas de chat/projetos/documentos/memória/agentes/
  configurações/admin, todas como base visual (sem dados reais ainda).
- **Tela inicial** (`app/page.tsx`) — landing com apresentação do
  produto e atalhos para login/dashboard.
- **Chat placeholder** (`app/dashboard/chat`) — layout de conversa com
  mensagens de exemplo; não conectado a nenhum provedor de IA.
- **Avatar placeholder animado** (`components/avatar-panel.tsx`) —
  indicador visual de persona (AURA/ARGUS) com **animação em CSS por
  estado** (`idle`: respiração sutil; `listening`: balanço + anéis
  pulsantes; `thinking`: pontos saltitantes; `speaking`: barras de
  "voz" animadas). Na tela de chat (`app/dashboard/chat`), o botão
  "Enviar" simula localmente essa sequência de estados — **sem chamar
  nenhuma IA** — só para demonstrar que o avatar reage à interação. A
  implementação real (lip-sync a partir de áudio de verdade, expressões
  faciais, Avatar Engine com visemas — Sprint-002.md §9) é uma sprint
  futura de `modules/avatar`.
- **Identidade visual** (`components/brand/logo-mark.tsx`) — logo em
  SVG (hexágono + "olho", gradiente violeta → ciano) e wordmark "AURA /
  ARGUS", com base no material de branding em
  `docs/brand/aura-argus-reference.png`. Substitui o placeholder de
  letra usado na sidebar e na landing page.
- **Botão de tema claro/escuro** (`components/theme-toggle.tsx`) —
  alterna e persiste a preferência (`localStorage`) e já afeta o fundo
  base e as variáveis de cor (`app/globals.css`). Ver "Pendências
  Técnicas" sobre o alcance atual dessa troca.
- **Estrutura do proxy de IA** (`backend/proxy-ai/route.ts`) — orquestra
  via `modules/ai-router`, sem usar nenhuma chave real.
- **Autenticação e Supabase** (`lib/supabase/*`, `app/login`,
  `app/register`) — clientes configurados e telas visuais; sem fluxo de
  autenticação real conectado ainda.
- **`.env.example`** — modelo de variáveis de ambiente (criado nesta
  tarefa; não existia anteriormente no repositório).

## O que NÃO foi implementado (fora de escopo)

- IA real (nenhuma chamada a Gemini ou Anthropic).
- FaceID real (`modules/faceid` é apenas placeholder).
- Voz real (`modules/voice` é apenas placeholder; Web Speech API não conectada).
- Integrações reais (Google Drive, Gmail, OneDrive, Outlook, Teams, GitHub, NotebookLM).
- Envio automático de mensagens (e-mail, WhatsApp).
- Memória persistente real (repositórios de `modules/memory` em memória, não em Supabase).
- Autenticação real (login/registro são apenas telas visuais).

## Variáveis de ambiente (`.env.example`)

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (frontend e backend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Uso exclusivo de backend (`lib/supabase/admin.ts`) |
| `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` | Uso exclusivo de backend — não conectadas ainda |
| `AI_ROUTER_DEFAULT_PROVIDER` / `AI_ROUTER_FALLBACK_PROVIDER` | Provedor padrão/fallback do AI Router estrutural |
| `NEXT_PUBLIC_APP_ENV` | Ambiente da aplicação (`development`/`production`) |

Nenhuma dessas chaves é lida em componentes de cliente — `lib/env.ts`
separa explicitamente `publicEnv` (frontend) de `serverEnv` (backend).

## Pendências Técnicas

- **Tema claro completo:** o botão de tema já funciona (toggle +
  persistência + variáveis CSS base), mas os componentes de
  `components/ui/*`, `sidebar` e `header` usam classes Tailwind fixas
  (`text-white`, `bg-slate-950/70`, etc.) em vez das variáveis de tema.
  Uma repintura completa para o tema claro exige revisar esses
  componentes — registrado aqui em vez de forçar uma solução fora do
  escopo desta tarefa.
- **Avatar real:** o placeholder atual já se movimenta por estado
  (CSS), mas isso é uma simulação local — não está ligado a áudio real.
  O Avatar Engine de verdade (lip-sync sincronizado com a fala real da
  IA/usuário, expressões faciais, possivelmente vídeo ou modelo 3D) é
  trabalho futuro de `modules/avatar`, e depende de: (1) Web Speech API
  real conectada (`modules/voice`) para saber quando o usuário está
  falando, e (2) a resposta em áudio/texto da IA real para saber quando
  e "o que" o avatar deveria estar "falando" (visemas).
- **IA real:** implementar `IAIProviderAdapter` para Gemini e Anthropic
  em `modules/ai-router`, sem alterar a política de roteamento já
  definida.
- **Persistência real:** substituir os repositórios em memória
  (`modules/memory`, `conversation`, `personality`, `workflow`) por
  Supabase, usando o schema em `database/ARQ-DB-001_aura_argus_database.sql`
  e `supabase/migrations`.
- **Autenticação real:** conectar `app/login` e `app/register` ao
  Supabase Auth (`lib/supabase/server.ts`, `lib/auth/session.ts`).
- **Integrações externas:** Google Drive, Gmail, OneDrive, Outlook,
  Teams, GitHub e NotebookLM — módulos preparados
  (`modules/documents`, `modules/knowledge-hub`, `modules/actions`),
  sem lógica de integração real ainda.

Relatórios detalhados de sprints anteriores: `docs/SPRINT-004-REPORT.md`
e `docs/SPRINT-005-FOUNDATION-UI.md`.

## Próximos passos sugeridos

1. Revisão desta entrega.
2. Conectar autenticação real via Supabase Auth.
3. Especificar e implementar a integração real com Gemini/Anthropic
   (`IAIProviderAdapter`).
4. Migrar os repositórios em memória dos módulos do Núcleo de
   Inteligência para Supabase.
5. Preparar a extensão futura para Google Drive, Gmail, OneDrive,
   Outlook, Teams, GitHub e NotebookLM dentro dos módulos já existentes
   (`documents`, `knowledge-hub`, `actions`).

---
Entrega finalizada. Aguardando revisão.
