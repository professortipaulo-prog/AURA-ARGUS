/**
 * modules/ai-router/interfaces.ts
 * Contratos do AI Router. Implementações concretas de provedores (Gemini,
 * Anthropic) serão criadas em sprint futura e devem satisfazer
 * IAIProviderAdapter sem exigir refatoração deste módulo.
 */
import type {
  AIRouterRequest,
  AIRouterResult,
  RoutingDecision,
  RoutingLogEntry,
  AIProvider
} from './types';

export interface IAIRouterService {
  /** Aplica a política de roteamento descrita em Sprint-002 §3.3 e retorna a decisão. */
  decideRoute(request: AIRouterRequest): RoutingDecision;
  /** Executa a rota decidida. Sprint 004: sempre retorna status 'not_implemented'. */
  execute(request: AIRouterRequest): Promise<AIRouterResult>;
  /** Aciona fallback para o provedor alternativo. */
  fallback(request: AIRouterRequest, from: AIProvider, reason: string): Promise<AIRouterResult>;
}

/**
 * Adapter que cada provedor de IA deverá implementar quando a integração
 * real for conectada. Mantido apenas como contrato nesta sprint.
 */
export interface IAIProviderAdapter {
  provider: AIProvider;
  isAvailable(): Promise<boolean>;
  send(request: AIRouterRequest, timeoutMs: number): Promise<unknown>;
}

export interface IAIRoutingRepository {
  logRouting(entry: RoutingLogEntry): Promise<void>;
  listRecentLogs(sessionId: string, limit?: number): Promise<RoutingLogEntry[]>;
}
