/**
 * lib/ai/ai-router.ts
 * Roteador de conexão real entre os provedores de IA configurados
 * (Sprint 006). Resolve o provedor solicitado (ou o padrão configurado
 * via DEFAULT_AI_PROVIDER), valida se está configurado e delega o envio
 * ao adapter correspondente.
 *
 * Nenhuma chave de API é exposta por este módulo — apenas o resultado
 * de `isConfigured()` (booleano) é consultável via getStatus().
 */
import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
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

export async function sendChat(body: ChatRequestBody): Promise<ChatResponseBody> {
  if (!body.message || !body.message.trim()) {
    throw new Error('O campo "message" é obrigatório.');
  }

  const provider = resolveProvider(body.provider);

  if (!provider.isConfigured()) {
    throw new ProviderNotConfiguredError(provider.id);
  }

  const model = body.model || provider.defaultModel;
  const response = await provider.send(body.message, model);

  return { provider: provider.id, model, response };
}
