export type AIProviderId = 'anthropic' | 'gemini';
export type AIPersonaId = 'aura' | 'argus';

export interface ChatRequestBody {
  message: string;
  provider?: AIProviderId;
  model?: string;
  systemPrompt?: string;
  persona?: AIPersonaId;
  sessionId?: string | null;
  projectId?: string | null;
}

export interface ChatResponseBody {
  provider: AIProviderId;
  model: string;
  response: string;
  route?: string | null;
  fallbackUsed?: boolean;
  fallbackFrom?: AIProviderId | null;
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
  send(message: string, model: string, systemPrompt?: string): Promise<string>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(public readonly provider: AIProviderId) {
    super(`O provedor "${provider}" não está configurado. Verifique a variável de ambiente correspondente.`);
    this.name = 'ProviderNotConfiguredError';
  }
}
