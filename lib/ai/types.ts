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
  resolvedModel: string | null;
  modelCount: number;
  error: string | null;
}

export interface AIStatusResponse {
  defaultProvider: AIProviderId;
  providers: ProviderStatusEntry[];
}

export interface AIProviderAdapter {
  id: AIProviderId;
  defaultModel: string;
  isConfigured(): boolean;
  send(message: string, model: string): Promise<string>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(public readonly provider: AIProviderId) {
    super(`O provedor "${provider}" não está configurado. Verifique a variável de ambiente correspondente.`);
    this.name = 'ProviderNotConfiguredError';
  }
}
