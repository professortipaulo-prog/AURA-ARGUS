/**
 * modules/ai-router/constants.ts
 * Valores default de timeout e provedores, alinhados a Sprint-002 §3.5
 * e ao .env.example. Em produção estes valores devem vir de variáveis
 * de ambiente lidas no backend (nunca no frontend).
 */
export const DEFAULT_PROVIDER: 'gemini' = 'gemini';
export const FALLBACK_PROVIDER: 'anthropic' = 'anthropic';

/** Timeouts lógicos por tipo de operação (ms) — Sprint-002 §3.5. */
export const TIMEOUTS_MS = {
  chat_simple: 8_000,
  document_analysis: 25_000,
  long_generation: 40_000,
  critical_action: 15_000,
  fallback: 6_000
} as const;

export const ROUTING_REASONS = {
  SIMPLE_FAST: 'Tarefa simples/rápida — provedor preferencial Gemini',
  ANALYTICAL_LONG: 'Tarefa analítica/longa — provedor preferencial Anthropic',
  DEFAULT_FALLBACK: 'Tipo de tarefa indefinido — usando provedor padrão configurado'
} as const;
