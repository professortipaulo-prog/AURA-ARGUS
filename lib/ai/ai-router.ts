import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
import {
  ProviderNotConfiguredError,
  type AIModelsResponse,
  type AIProviderAdapter,
  type AIProviderId,
  type AIStatusResponse,
  type ChatRequestBody,
  type ChatResponseBody
} from './types';

const PROVIDERS: Record<AIProviderId, AIProviderAdapter> = {
  anthropic: anthropicProvider,
  gemini: geminiProvider
};

function getDefaultProviderId(): AIProviderId {
  const configured = (process.env.DEFAULT_AI_PROVIDER || 'anthropic').toLowerCase();
  return configured === 'gemini' ? 'gemini' : 'anthropic';
}

export function resolveProvider(providerId?: AIProviderId): AIProviderAdapter {
  const id = providerId ?? getDefaultProviderId();
  const provider = PROVIDERS[id];
  if (!provider) throw new Error(`Provedor de IA desconhecido: ${id}`);
  return provider;
}

export function getStatus(): AIStatusResponse {
  return {
    defaultProvider: getDefaultProviderId(),
    providers: Object.values(PROVIDERS).map((provider) => ({
      provider: provider.id,
      configured: provider.isConfigured(),
      defaultModel: provider.defaultModel
    }))
  };
}

export async function getAvailableModels(): Promise<AIModelsResponse> {
  const providers = await Promise.all(
    Object.values(PROVIDERS).map(async (provider) => {
      if (!provider.isConfigured()) {
        return {
          provider: provider.id,
          configured: false,
          defaultModel: provider.defaultModel,
          models: []
        };
      }

      try {
        const models = await provider.listModels();
        const selectedModel = await provider.resolveModel();
        return {
          provider: provider.id,
          configured: true,
          defaultModel: provider.defaultModel,
          selectedModel,
          models
        };
      } catch (error) {
        return {
          provider: provider.id,
          configured: true,
          defaultModel: provider.defaultModel,
          models: [],
          error: error instanceof Error ? error.message : 'Erro desconhecido ao listar modelos.'
        };
      }
    })
  );

  return { defaultProvider: getDefaultProviderId(), providers };
}

export async function sendChat(body: ChatRequestBody): Promise<ChatResponseBody> {
  if (!body.message || !body.message.trim()) throw new Error('O campo "message" é obrigatório.');

  const provider = resolveProvider(body.provider);
  if (!provider.isConfigured()) throw new ProviderNotConfiguredError(provider.id);

  const result = await provider.send(body.message, body.model);
  return { provider: provider.id, model: result.model, response: result.text };
}
