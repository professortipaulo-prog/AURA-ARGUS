# Módulo: AI Router

Responsável por decidir entre Gemini e Anthropic, preservando contexto,
custo, latência e adequação da tarefa (ver `Sprint-002.md`, seção 3).

## Status — Sprint 004

- [x] Estrutura para seleção entre Gemini e Anthropic (`decideRoute`).
- [x] Estratégia de fallback (`fallback`).
- [x] Timeouts lógicos por tipo de operação (`constants.ts`).
- [x] Interface única para chamadas futuras (`IAIRouterService`, `IAIProviderAdapter`).
- [ ] Conexão real com Gemini — **fora de escopo desta sprint**.
- [ ] Conexão real com Anthropic — **fora de escopo desta sprint**.

## Arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `types.ts` | Tipos de requisição, decisão e resultado de roteamento |
| `interfaces.ts` | Contratos (`IAIRouterService`, `IAIProviderAdapter`, `IAIRoutingRepository`) |
| `constants.ts` | Timeouts e provedores padrão |
| `utils.ts` | Heurísticas de classificação e helpers |
| `repository.ts` | Persistência dos logs de roteamento (em memória nesta sprint) |
| `service.ts` | Política de roteamento (Sprint-002 §3.3/§3.4) |
| `controller.ts` | Camada de orquestração para futura rota de API |
| `hooks.ts` | Hook de cliente React para uso no Chat |

## Pendências técnicas

- Implementar `IAIProviderAdapter` concreto para Gemini e Anthropic.
- Conectar `controller.ts` a uma rota real (`app/api/ai-router/route.ts`).
- Substituir `InMemoryAIRoutingRepository` por persistência Supabase
  (tabela sugerida: `ai_routing_logs`).
- Calcular custo estimado real (`estimateCost`) a partir de tokens por provedor.
