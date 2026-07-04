/**
 * AI Router com decisão automática, fallback e metadados de roteamento.
 * Mantém o AI Provider Manager: modelos continuam resolvidos por descoberta.
 */
import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
import { listAllModels, resolveProviderModel } from './model-discovery';
import { decideAIRoute, getRouterPolicySummary } from './router-policy';
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

export async function getRouterDiagnostics() {
  const [status, inventory] = await Promise.all([getStatus(), listAllModels(false)]);
  return {
    policy: getRouterPolicySummary(),
    status,
    inventory
  };
}

export async function getModelInventory(forceRefresh = false) {
  return listAllModels(forceRefresh);
}

async function sendWithProvider(provider: AIProviderAdapter, body: ChatRequestBody): Promise<{ model: string; response: string }> {
  if (!provider.isConfigured()) {
    throw new ProviderNotConfiguredError(provider.id);
  }

  const requestedModel = body.model || provider.defaultModel;
  const resolvedModel = await resolveProviderModel(provider.id, requestedModel);
  const response = await provider.send(body.message, resolvedModel, body.systemPrompt);
  return { model: resolvedModel, response };
}

export async function sendChat(body: ChatRequestBody): Promise<ChatResponseBody> {
  if (!body.message || !body.message.trim()) {
    throw new Error('O campo "message" é obrigatório.');
  }

  const route = decideAIRoute({
    message: body.message,
    persona: body.persona,
    provider: body.provider,
    model: body.model
  });

  const primaryProvider = resolveProvider(route.provider);

  try {
    const result = await sendWithProvider(primaryProvider, body);
    return {
      provider: primaryProvider.id,
      model: result.model,
      response: result.response,
      route,
      fallbackUsed: false,
      fallbackFrom: null
    };
  } catch (primaryError) {
    const fallbackId = route.fallbackOrder.find((providerId) => providerId !== primaryProvider.id);
    const fallbackProvider = fallbackId ? resolveProvider(fallbackId) : null;

    if (fallbackProvider?.isConfigured()) {
      try {
        const result = await sendWithProvider(fallbackProvider, { ...body, provider: fallbackProvider.id, model: undefined });
        return {
          provider: fallbackProvider.id,
          model: result.model,
          response: result.response,
          route,
          fallbackUsed: true,
          fallbackFrom: primaryProvider.id
        };
      } catch {
        // Retorna o erro primário abaixo para preservar a causa mais provável.
      }
    }

    throw primaryError;
  }
}
