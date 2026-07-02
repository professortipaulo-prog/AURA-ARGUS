# Relatório Técnico — Sprint 004 (CLAUDE-004)

**Projeto:** AURA / ARGUS
**Papel:** Lead Software Engineer (Claude)
**Objetivo da sprint:** Implementar o Núcleo de Inteligência (Core
Intelligence) do sistema.
**Status:** Entregue para revisão do Chief AI Architect.

## Escopo entregue

1. **AI Router** (`modules/ai-router`) — política de seleção entre
   Gemini/Anthropic, fallback e timeouts por tipo de operação,
   interface única para chamadas futuras.
2. **Conversation Manager** (`modules/conversation`) — histórico,
   contexto de sessão e suporte a múltiplas conversas.
3. **Context Builder** (`modules/context-builder`) — construção de
   contexto de usuário, projeto e conversa, com ranqueamento e
   compactação por orçamento de tokens.
4. **Prompt Builder** (`modules/prompt-builder`) — montagem de System
   Prompt, Context Prompt e User Prompt.
5. **Memory Retrieval** (`modules/memory`) — leitura/escrita de memória
   por camada, metadados para banco vetorial futuro, exportação por
   usuário.
6. **Personality Engine** (`modules/personality`) — personas AURA e
   ARGUS, formalidade, humor e estrutura de perfil DISC.
7. **Workflow Engine** (`modules/workflow`) — planejamento, execução,
   monitoramento e finalização de tarefas multi-etapas.

Todos os módulos seguem o padrão obrigatório definido pelo Chief AI
Architect a partir desta sprint:

```
module/
├── types.ts
├── interfaces.ts
├── service.ts
├── repository.ts
├── controller.ts
├── hooks.ts
├── utils.ts
├── constants.ts
├── index.ts
└── README.md
```

## Regras respeitadas

- Nenhuma chamada HTTP real a Gemini ou Anthropic foi implementada.
- Nenhuma chave de API é lida ou exposta no frontend (`lib/env.ts`
  separa `publicEnv` de `serverEnv`).
- Nenhuma funcionalidade fora do escopo definido (avatar, voz, câmera,
  FaceID, ações reais e integrações externas permanecem como módulos
  placeholder, sem lógica).
- Arquitetura e stack oficiais não foram alteradas.

## Diagrama

Ver `docs/diagrams/core-intelligence.mmd` — fluxo:
Usuário → Conversation Manager → Context Builder (+ Memory Retrieval +
User Profile/Knowledge Hub) → Prompt Builder (+ Personality Engine) →
AI Router → (Gemini/Anthropic — não conectados nesta sprint). Workflow
Engine se conecta ao futuro Action Manager.

## Critério de aceite

> "Ao final deverá existir toda a infraestrutura do núcleo de
> inteligência pronta para receber posteriormente as APIs da Anthropic
> e Gemini, sem necessidade de refatoração da arquitetura."

Atendido: `IAIProviderAdapter` (em `modules/ai-router/interfaces.ts`) é
o único ponto de extensão necessário para conectar os provedores reais;
nenhum outro módulo precisa ser alterado quando isso ocorrer.

## Pendências técnicas (consolidado)

| Módulo | Pendência principal |
| --- | --- |
| AI Router | Implementar `IAIProviderAdapter` para Gemini e Anthropic |
| Conversation Manager | Persistência Supabase (`conversations`, `messages`) |
| Context Builder | Conectar a User Profile / Knowledge Hub reais |
| Prompt Builder | Persistir templates versionados por persona |
| Memory Retrieval | Conectar banco vetorial (pgvector) e embeddings reais |
| Personality Engine | Persistência Supabase (`personality_settings`) |
| Workflow Engine | Conectar ao futuro Action Manager para execução real |

## Próxima sprint sugerida

Conforme Roadmap Geral (COM-005) — Fase 4 (Memória e Executor de
Ações): implementar o Action Manager real (Sprint-002 §5) e iniciar a
conexão efetiva com Gemini/Anthropic via `IAIProviderAdapter`.

Aguardando revisão do Chief AI Architect.
