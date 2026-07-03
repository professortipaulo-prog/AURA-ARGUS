import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIModelInfo, AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.GEMINI_DEFAULT_MODEL || 'auto';

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY não configurada.');
  return apiKey;
}

function getClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getApiKey());
}

function normalizeModelId(model: string): string {
  return model.trim().replace(/^models\//, '');
}

function isAutoModel(model?: string): boolean {
  return !model || model === 'auto' || model === 'latest';
}

function selectBestGeminiModel(models: AIModelInfo[], requested?: string): string {
  const usable = models.filter((model) => model.supportsGenerateContent !== false);
  const ids = usable.map((model) => normalizeModelId(model.id));
  const normalizedRequested = requested ? normalizeModelId(requested) : '';

  if (normalizedRequested && !isAutoModel(normalizedRequested) && ids.includes(normalizedRequested)) {
    return normalizedRequested;
  }

  const flash = ids.find((id) => /flash/i.test(id));
  if (flash) return flash;

  const pro = ids.find((id) => /pro/i.test(id));
  if (pro) return pro;

  if (ids[0]) return ids[0];

  if (normalizedRequested && !isAutoModel(normalizedRequested)) return normalizedRequested;
  throw new Error('Nenhum modelo Gemini disponível para generateContent nesta chave.');
}

async function fetchGeminiModels(): Promise<AIModelInfo[]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${getApiKey()}`, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Não foi possível listar modelos do Gemini (${response.status}): ${text.slice(0, 240)}`);
  }

  const payload = (await response.json()) as {
    models?: Array<{
      name?: string;
      displayName?: string;
      description?: string;
      supportedGenerationMethods?: string[];
    }>;
  };

  return (payload.models || [])
    .map((model) => {
      const id = normalizeModelId(model.name || '');
      return {
        id,
        name: model.displayName || id,
        provider: 'gemini' as const,
        description: model.description,
        supportsGenerateContent: (model.supportedGenerationMethods || []).includes('generateContent')
      };
    })
    .filter((model) => Boolean(model.id));
}

function isModelNotFound(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not found|404|models\/|not supported/i.test(message);
}

export const geminiProvider: AIProviderAdapter = {
  id: 'gemini',
  defaultModel: DEFAULT_MODEL,

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  },

  async listModels(): Promise<AIModelInfo[]> {
    if (!this.isConfigured()) return [];
    return fetchGeminiModels();
  },

  async resolveModel(model?: string): Promise<string> {
    const requested = model || DEFAULT_MODEL;
    if (!isAutoModel(requested)) return normalizeModelId(requested);
    const models = await this.listModels();
    return selectBestGeminiModel(models, requested);
  },

  async send(message: string, model?: string): Promise<{ text: string; model: string }> {
    const client = getClient();
    let resolvedModel = await this.resolveModel(model);

    async function callGemini(activeModel: string) {
      const generativeModel = client.getGenerativeModel({ model: activeModel });
      return generativeModel.generateContent(message);
    }

    try {
      const result = await callGemini(resolvedModel);
      const text = result.response.text();
      if (!text) throw new Error('Resposta do Gemini sem conteúdo de texto.');
      return { text, model: resolvedModel };
    } catch (error) {
      if (!isModelNotFound(error)) throw error;

      const models = await this.listModels();
      resolvedModel = selectBestGeminiModel(models, 'auto');
      const result = await callGemini(resolvedModel);
      const text = result.response.text();
      if (!text) throw new Error('Resposta do Gemini sem conteúdo de texto.');
      return { text, model: resolvedModel };
    }
  }
};
