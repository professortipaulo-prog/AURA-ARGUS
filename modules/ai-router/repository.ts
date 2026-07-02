/**
 * modules/ai-router/repository.ts
 * Persistência dos logs de roteamento (Sprint-002 §3.7 — gestão de custos).
 * Sprint 004: implementação em memória. A troca para Supabase (tabela
 * `ai_routing_logs`) não deve exigir mudança de interface (IAIRoutingRepository).
 */
import type { IAIRoutingRepository } from './interfaces';
import type { RoutingLogEntry } from './types';

export class InMemoryAIRoutingRepository implements IAIRoutingRepository {
  private logs: RoutingLogEntry[] = [];

  async logRouting(entry: RoutingLogEntry): Promise<void> {
    this.logs.push(entry);
  }

  async listRecentLogs(sessionId: string, limit = 20): Promise<RoutingLogEntry[]> {
    return this.logs
      .filter((log) => log.sessionId === sessionId)
      .slice(-limit)
      .reverse();
  }
}
