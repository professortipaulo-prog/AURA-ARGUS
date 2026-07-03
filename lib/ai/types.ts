/**
 * Tipos do AI Provider Manager.
 * Mantém as chaves no servidor e expõe apenas metadados seguros.
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

export interface AIModelInfo {
  id: string;
  name: string;
  provider: AIProviderId;
  description?: string;
  supportsGenerateContent?: boolean;
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

export interface AIModelsResponse {
  defaultProvider: AIProviderId;
  providers: Array<{
    provider: AIProviderId;
    configured: boolean;
    defaultModel: string;
    selectedModel?: string;
    models: AIModelInfo[];
    error?: string;
  }>;
}

/** Contrato que cada provedor concreto deve implementar. */
export interface AIProviderAdapter {
  id: AIProviderId;
  defaultModel: string;
  isConfigured(): boolean;
  listModels(): Promise<AIModelInfo[]>;
  resolveModel(model?: string): Promise<string>;
  send(message: string, model?: string): Promise<{ text: string; model: string }>;
}

/** Erro amigável quando um provedor é solicitado sem chave configurada. */
export class ProviderNotConfiguredError extends Error {
  constructor(public readonly provider: AIProviderId) {
    super(`O provedor "${provider}" não está configurado. Verifique a variável de ambiente correspondente.`);
    this.name = 'ProviderNotConfiguredError';
  }
}
