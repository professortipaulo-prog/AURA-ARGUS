/**
 * AI Router real com AI Provider Manager.
 * Não usa mais nomes de modelos fixos. Quando DEFAULT_AI_MODEL ou
 * GEMINI_DEFAULT_MODEL estiverem como "auto", o sistema consulta os
 * modelos disponíveis na conta e escolhe um modelo compatível.
 */
import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
import { listAllModels, resolveProviderModel } from './model-discovery';
import {
  ProviderNotConfiguredError,
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
  if (!provider) {
    throw new Error(`Provedor de IA desconhecido: ${id}`);
  }
  return provider;
}

export async function getStatus(): Promise<AIStatusResponse> {
  const modelInventory = await listAllModels(false);
  return {
    defaultProvider: getDefaultProviderId(),
    providers: await Promise.all(
      Object.values(PROVIDERS).map(async (provider) => {
        let resolvedModel: string | null = null;
        let error: string | null = null;
        if (provider.isConfigured()) {
          try {
            resolvedModel = await resolveProviderModel(provider.id, provider.defaultModel);
          } catch (err) {
            error = err instanceof Error ? err.message : 'Não foi possível resolver o modelo.';
          }
        }
        return {
          provider: provider.id,
          configured: provider.isConfigured(),
          defaultModel: provider.defaultModel,
          resolvedModel,
          modelCount: modelInventory.providers[provider.id].models.length,
          error: error || modelInventory.providers[provider.id].error
        };
      })
    )
  };
}

export async function getModelInventory(forceRefresh = false) {
  return listAllModels(forceRefresh);
}

export async function sendChat(body: ChatRequestBody): Promise<ChatResponseBody> {
  if (!body.message || !body.message.trim()) {
    throw new Error('O campo "message" é obrigatório.');
  }

  const provider = resolveProvider(body.provider);

  if (!provider.isConfigured()) {
    throw new ProviderNotConfiguredError(provider.id);
  }

  const requestedModel = body.model || provider.defaultModel;
  const resolvedModel = await resolveProviderModel(provider.id, requestedModel);

  try {
    const response = await provider.send(body.message, resolvedModel);
    return { provider: provider.id, model: resolvedModel, response };
  } catch (primaryError) {
    const fallbackProvider = provider.id === 'anthropic' ? geminiProvider : anthropicProvider;
    if (fallbackProvider.isConfigured()) {
      try {
        const fallbackModel = await resolveProviderModel(fallbackProvider.id, fallbackProvider.defaultModel);
        const response = await fallbackProvider.send(body.message, fallbackModel);
        return { provider: fallbackProvider.id, model: fallbackModel, response };
      } catch {
        // Retorna o erro primário abaixo.
      }
    }

    throw primaryError;
  }
}
