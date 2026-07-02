# Módulo: Conversation Manager

Gerenciamento das conversas: histórico, contexto de sessão e preparação
para múltiplas conversas simultâneas por usuário (Sprint-002 §2.2, §4).

## Status — Sprint 004

- [x] Criação e listagem de conversas por usuário.
- [x] Histórico de mensagens com limite configurável.
- [x] Contexto de sessão (conversa ativa, persona ativa).
- [x] Suporte estrutural a múltiplas conversas simultâneas.
- [ ] Persistência real em Supabase — pendente.

## Pendências técnicas

- Substituir `InMemoryConversationRepository` por repositório Supabase
  (tabelas sugeridas: `conversations`, `messages`).
- Expor `controller.ts` em `app/api/conversations/route.ts`.
- Sincronizar `switchPersona` com o Personality Engine ao trocar de
  assistente (AURA/ARGUS) no meio da conversa.
