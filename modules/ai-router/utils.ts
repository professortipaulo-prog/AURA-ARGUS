/**
 * modules/ai-router/utils.ts
 * Funções auxiliares puras usadas pela política de roteamento.
 */
import type { OperationKind, TaskComplexity } from './types';
import { TIMEOUTS_MS } from './constants';

/** Deriva o timeout lógico a partir do tipo de operação (Sprint-002 §3.5). */
export function resolveTimeout(operationKind: OperationKind): number {
  return TIMEOUTS_MS[operationKind] ?? TIMEOUTS_MS.chat_simple;
}

/**
 * Classificação heurística simples de complexidade a partir do tamanho do
 * prompt final. Sprint 004: heurística provisória; Context Builder poderá
 * futuramente enviar a classificação já calculada.
 */
export function classifyComplexity(promptLength: number): TaskComplexity {
  if (promptLength === 0) return 'undefined';
  if (promptLength < 400) return 'simple_fast';
  return 'analytical_long';
}

export function generateLogId(): string {
  return `route_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
