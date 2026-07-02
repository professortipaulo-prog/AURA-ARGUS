/**
 * modules/ai-router/service.ts
 * Implementação da política de roteamento descrita em Sprint-002 §3.3/§3.4.
 * NENHUMA chamada HTTP a Gemini ou Anthropic é feita nesta sprint —
 * `execute` e `fallback` retornam status 'not_implemented' e apenas
 * registram a decisão de roteamento para auditoria futura.
 */
import type { IAIRouterService, IAIRoutingRepository } from './interfaces';
import type {
  AIRouterRequest,
  AIRouterResult,
  AIProvider,
  RoutingDecision,
  FallbackReason
} from './types';
import { DEFAULT_PROVIDER, FALLBACK_PROVIDER, ROUTING_REASONS } from './constants';
import { resolveTimeout, generateLogId, nowISO } from './utils';
import { InMemoryAIRoutingRepository } from './repository';

export class AIRouterService implements IAIRouterService {
  constructor(private readonly repository: IAIRoutingRepository = new InMemoryAIRoutingRepository()) {}

  decideRoute(request: AIRouterRequest): RoutingDecision {
    const timeoutMs = resolveTimeout(request.operationKind);

    switch (request.taskComplexity) {
      case 'simple_fast':
        return { provider: 'gemini', reason: ROUTING_REASONS.SIMPLE_FAST, isFallback: false, timeoutMs };
      case 'analytical_long':
        return { provider: 'anthropic', reason: ROUTING_REASONS.ANALYTICAL_LONG, isFallback: false, timeoutMs };
      case 'undefined':
      default:
        return { provider: DEFAULT_PROVIDER, reason: ROUTING_REASONS.DEFAULT_FALLBACK, isFallback: false, timeoutMs };
    }
  }

  async execute(request: AIRouterRequest): Promise<AIRouterResult> {
    const decision = this.decideRoute(request);

    await this.repository.logRouting({
      id: generateLogId(),
      sessionId: request.sessionId,
      provider: decision.provider,
      operationKind: request.operationKind,
      isFallback: decision.isFallback,
      estimatedTokens: request.estimatedTokens,
      timeoutMs: decision.timeoutMs,
      createdAt: nowISO()
    });

    // Ponto de extensão futuro: aqui entrará a chamada real ao
    // IAIProviderAdapter correspondente (Gemini ou Anthropic).
    return { decision, status: 'not_implemented', loggedAt: nowISO() };
  }

  async fallback(request: AIRouterRequest, from: AIProvider, reason: FallbackReason): Promise<AIRouterResult> {
    const alternative: AIProvider = from === 'gemini' ? FALLBACK_PROVIDER : DEFAULT_PROVIDER;
    const decision: RoutingDecision = {
      provider: alternative,
      reason: `Fallback a partir de ${from}: ${reason}`,
      isFallback: true,
      timeoutMs: resolveTimeout('fallback')
    };

    await this.repository.logRouting({
      id: generateLogId(),
      sessionId: request.sessionId,
      provider: decision.provider,
      operationKind: request.operationKind,
      isFallback: true,
      fallbackReason: reason,
      estimatedTokens: request.estimatedTokens,
      timeoutMs: decision.timeoutMs,
      createdAt: nowISO()
    });

    return { decision, status: 'not_implemented', loggedAt: nowISO() };
  }
}
