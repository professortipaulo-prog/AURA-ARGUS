/**
 * modules/ai-router/types.ts
 * Tipos do AI Router — roteamento entre provedores de IA (Gemini/Anthropic).
 * Sprint 004: apenas estrutura. Nenhuma chamada real de API é feita aqui.
 */

export type AIProvider = 'gemini' | 'anthropic';

/** Classificação da tarefa, usada pela política de roteamento (Sprint-002 §3.3). */
export type TaskComplexity =
  | 'simple_fast'      // respostas rápidas e gerais -> Gemini preferencial
  | 'analytical_long'  // planejamento, análise, redação complexa -> Anthropic preferencial
  | 'undefined';        // tipo indefinido -> provedor padrão configurado

export type OperationKind =
  | 'chat_simple'
  | 'document_analysis'
  | 'long_generation'
  | 'critical_action'
  | 'fallback';

export interface AIRouterRequest {
  /** Identificador da conversa/sessão (ver Conversation Manager). */
  sessionId: string;
  /** Prompt final já montado pelo Prompt Builder. Não é responsabilidade do Router montar prompt. */
  prompt: PromptPayload;
  /** Classificação previamente calculada pelo Context Builder / Intent Resolver. */
  taskComplexity: TaskComplexity;
  operationKind: OperationKind;
  /** Metadados de custo/latência já conhecidos, se houver. */
  estimatedTokens?: number;
}

export interface PromptPayload {
  systemPrompt: string;
  contextPrompt: string;
  userPrompt: string;
}

export interface RoutingDecision {
  provider: AIProvider;
  reason: string;
  isFallback: boolean;
  timeoutMs: number;
}

export type FallbackReason =
  | 'api_error'
  | 'timeout'
  | 'unavailable'
  | 'quota_exceeded'
  | 'invalid_response'
  | 'low_confidence';

export interface AIRouterResult {
  decision: RoutingDecision;
  /**
   * Sprint 004: resposta é sempre um stub — a integração real de IA
   * (chamada HTTP a Gemini/Anthropic) será implementada em sprint futura.
   */
  status: 'not_implemented';
  loggedAt: string;
}

export interface RoutingLogEntry {
  id: string;
  sessionId: string;
  provider: AIProvider;
  operationKind: OperationKind;
  isFallback: boolean;
  fallbackReason?: FallbackReason;
  estimatedTokens?: number;
  timeoutMs: number;
  createdAt: string;
}
