/**
 * lib/ai/types.ts
 * Tipos do AI Provider Setup (Sprint 006). Camada de conexão real com
 * Anthropic Claude e Google Gemini, isolada em lib/ai/*.
 *
 * Relação com modules/ai-router: aquele módulo (Sprint 004) contém a
 * POLÍTICA de roteamento (classificação de tarefa, fallback, timeouts)
 * de forma estrutural, sem chamadas reais. Este arquivo e os demais em
 * lib/ai/* fazem a CONEXÃO real com os provedores, mantida
 * deliberadamente em um módulo separado para não exigir alterações em
 * modules/ai-router nesta sprint.
 */

export type AIProviderId = 'anthropic' | 'gemini';

export interface ChatRequestBody {
  message: string;
  provider?: AIProviderId;
  model?: string;
}

export interface ChatResponseBody {
  provider: AIProviderId;
  model: string;
  response: string;
}

export interface ProviderStatusEntry {
  provider: AIProviderId;
  configured: boolean;
  defaultModel: string;
}

export interface AIStatusResponse {
  defaultProvider: AIProviderId;
  providers: ProviderStatusEntry[];
}

/** Contrato que cada provedor concreto (Anthropic, Gemini) deve implementar. */
export interface AIProviderAdapter {
  id: AIProviderId;
  defaultModel: string;
  isConfigured(): boolean;
  send(message: string, model?: string): Promise<string>;
}

/** Erro amigável quando um provedor é solicitado sem chave configurada. */
export class ProviderNotConfiguredError extends Error {
  constructor(public readonly provider: AIProviderId) {
    super(`O provedor "${provider}" não está configurado. Verifique a variável de ambiente correspondente.`);
    this.name = 'ProviderNotConfiguredError';
  }
}
