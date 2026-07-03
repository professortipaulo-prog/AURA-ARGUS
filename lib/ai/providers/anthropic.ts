import Anthropic from '@anthropic-ai/sdk';
import type { AIModelInfo, AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || 'auto';
const ANTHROPIC_VERSION = '2023-06-01';

function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada.');
  return apiKey;
}

function getClient(): Anthropic {
  return new Anthropic({ apiKey: getApiKey() });
}

function normalizeModelId(model: string): string {
  return model.trim();
}

function isAutoModel(model?: string): boolean {
  return !model || model === 'auto' || model === 'latest';
}

function selectBestAnthropicModel(models: AIModelInfo[], requested?: string): string {
  const ids = models.map((m) => m.id);
  const normalizedRequested = requested ? normalizeModelId(requested) : '';

  if (normalizedRequested && !isAutoModel(normalizedRequested) && ids.includes(normalizedRequested)) {
    return normalizedRequested;
  }

  const sonnet = ids.find((id) => /sonnet/i.test(id));
  if (sonnet) return sonnet;

  const opus = ids.find((id) => /opus/i.test(id));
  if (opus) return opus;

  const haiku = ids.find((id) => /haiku/i.test(id));
  if (haiku) return haiku;

  if (ids[0]) return ids[0];

  if (normalizedRequested && !isAutoModel(normalizedRequested)) return normalizedRequested;
  throw new Error('Nenhum modelo Anthropic disponível para esta chave.');
}

async function fetchAnthropicModels(): Promise<AIModelInfo[]> {
  const response = await fetch('https://api.anthropic.com/v1/models', {
    method: 'GET',
    headers: {
      'x-api-key': getApiKey(),
      'anthropic-version': ANTHROPIC_VERSION
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Não foi possível listar modelos da Anthropic (${response.status}): ${text.slice(0, 240)}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ id?: string; display_name?: string; name?: string }>;
  };

  return (payload.data || [])
    .map((model) => {
      const id = model.id || model.name || '';
      return {
        id,
        name: model.display_name || id,
        provider: 'anthropic' as const,
        supportsGenerateContent: true
      };
    })
    .filter((model) => Boolean(model.id));
}

function isModelNotFound(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /model|not_found|not found|404/i.test(message);
}

export const anthropicProvider: AIProviderAdapter = {
  id: 'anthropic',
  defaultModel: DEFAULT_MODEL,

  isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async listModels(): Promise<AIModelInfo[]> {
    if (!this.isConfigured()) return [];
    return fetchAnthropicModels();
  },

  async resolveModel(model?: string): Promise<string> {
    const requested = model || DEFAULT_MODEL;
    if (!isAutoModel(requested)) return normalizeModelId(requested);
    const models = await this.listModels();
    return selectBestAnthropicModel(models, requested);
  },

  async send(message: string, model?: string): Promise<{ text: string; model: string }> {
    const client = getClient();
    let resolvedModel = await this.resolveModel(model);

    async function callAnthropic(activeModel: string) {
      return client.messages.create({
        model: activeModel,
        max_tokens: 1024,
        messages: [{ role: 'user', content: message }]
      });
    }

    try {
      const response = await callAnthropic(resolvedModel);
      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('Resposta da Anthropic sem conteúdo de texto.');
      return { text: textBlock.text, model: resolvedModel };
    } catch (error) {
      if (!isModelNotFound(error)) throw error;

      const models = await this.listModels();
      resolvedModel = selectBestAnthropicModel(models, 'auto');
      const response = await callAnthropic(resolvedModel);
      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('Resposta da Anthropic sem conteúdo de texto.');
      return { text: textBlock.text, model: resolvedModel };
    }
  }
};
