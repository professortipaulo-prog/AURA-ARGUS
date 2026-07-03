import type { AIProviderId } from './types';

export type AIModelCapability = 'chat' | 'text' | 'unknown';

export interface AIModelInfo {
  provider: AIProviderId;
  id: string;
  apiName: string;
  displayName: string;
  description?: string;
  createdAt?: string;
  supportsGenerateContent: boolean;
  capability: AIModelCapability;
}

const CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry<T> = { expiresAt: number; data: T };

const cache: Partial<Record<AIProviderId, CacheEntry<AIModelInfo[]>>> = {};

function now() {
  return Date.now();
}

function stripGoogleModelPrefix(model: string) {
  return model.replace(/^models\//, '');
}

function normalizeModel(model?: string) {
  if (!model || model.trim().toLowerCase() === 'auto') return 'auto';
  return model.trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickAnthropicModel(models: AIModelInfo[]): AIModelInfo | null {
  const available = models.filter((m) => m.supportsGenerateContent);
  const sorted = [...available].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  return (
    sorted.find((m) => /sonnet/i.test(m.id) || /sonnet/i.test(m.displayName)) ||
    sorted.find((m) => /opus/i.test(m.id) || /opus/i.test(m.displayName)) ||
    sorted.find((m) => /haiku/i.test(m.id) || /haiku/i.test(m.displayName)) ||
    sorted[0] ||
    null
  );
}

function pickGeminiModel(models: AIModelInfo[]): AIModelInfo | null {
  const available = models.filter((m) => m.supportsGenerateContent);
  return (
    available.find((m) => /flash/i.test(m.id) || /flash/i.test(m.displayName)) ||
    available.find((m) => /pro/i.test(m.id) || /pro/i.test(m.displayName)) ||
    available[0] ||
    null
  );
}

export async function listAnthropicModels(forceRefresh = false): Promise<AIModelInfo[]> {
  const cached = cache.anthropic;
  if (!forceRefresh && cached && cached.expiresAt > now()) return cached.data;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const response = await fetch('https://api.anthropic.com/v1/models', {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Não foi possível listar modelos Anthropic (${response.status}). ${message}`.trim());
  }

  const payload = (await response.json()) as {
    data?: Array<{ id?: unknown; display_name?: unknown; created_at?: unknown; type?: unknown }>;
  };

  const models = (payload.data || [])
    .filter((model) => isNonEmptyString(model.id))
    .map((model) => ({
      provider: 'anthropic' as const,
      id: String(model.id),
      apiName: String(model.id),
      displayName: isNonEmptyString(model.display_name) ? String(model.display_name) : String(model.id),
      createdAt: isNonEmptyString(model.created_at) ? String(model.created_at) : undefined,
      supportsGenerateContent: true,
      capability: 'chat' as const
    }));

  cache.anthropic = { expiresAt: now() + CACHE_TTL_MS, data: models };
  return models;
}

export async function listGeminiModels(forceRefresh = false): Promise<AIModelInfo[]> {
  const cached = cache.gemini;
  if (!forceRefresh && cached && cached.expiresAt > now()) return cached.data;

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Não foi possível listar modelos Gemini (${response.status}). ${message}`.trim());
  }

  const payload = (await response.json()) as {
    models?: Array<{
      name?: unknown;
      displayName?: unknown;
      description?: unknown;
      supportedGenerationMethods?: unknown;
    }>;
  };

  const models = (payload.models || [])
    .filter((model) => isNonEmptyString(model.name))
    .map((model) => {
      const methods = Array.isArray(model.supportedGenerationMethods) ? model.supportedGenerationMethods.map(String) : [];
      const apiName = stripGoogleModelPrefix(String(model.name));
      return {
        provider: 'gemini' as const,
        id: apiName,
        apiName,
        displayName: isNonEmptyString(model.displayName) ? String(model.displayName) : apiName,
        description: isNonEmptyString(model.description) ? String(model.description) : undefined,
        supportsGenerateContent: methods.includes('generateContent'),
        capability: methods.includes('generateContent') ? ('chat' as const) : ('unknown' as const)
      };
    });

  cache.gemini = { expiresAt: now() + CACHE_TTL_MS, data: models };
  return models;
}

export async function listProviderModels(provider: AIProviderId, forceRefresh = false): Promise<AIModelInfo[]> {
  return provider === 'anthropic' ? listAnthropicModels(forceRefresh) : listGeminiModels(forceRefresh);
}

export async function resolveProviderModel(provider: AIProviderId, requestedModel?: string): Promise<string> {
  const normalized = normalizeModel(requestedModel);
  const models = await listProviderModels(provider);

  if (normalized !== 'auto') {
    const requestedComparable = provider === 'gemini' ? stripGoogleModelPrefix(normalized) : normalized;
    const exists = models.some((model) => model.apiName === requestedComparable || model.id === requestedComparable);
    if (exists) return requestedComparable;

    const fallback = provider === 'anthropic' ? pickAnthropicModel(models) : pickGeminiModel(models);
    if (fallback) return fallback.apiName;
    return requestedComparable;
  }

  const selected = provider === 'anthropic' ? pickAnthropicModel(models) : pickGeminiModel(models);
  if (!selected) {
    throw new Error(`Nenhum modelo compatível encontrado para o provedor ${provider}.`);
  }
  return selected.apiName;
}

export async function listAllModels(forceRefresh = false) {
  const [anthropic, gemini] = await Promise.allSettled([
    listAnthropicModels(forceRefresh),
    listGeminiModels(forceRefresh)
  ]);

  return {
    providers: {
      anthropic: {
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
        models: anthropic.status === 'fulfilled' ? anthropic.value : [],
        error: anthropic.status === 'rejected' ? anthropic.reason instanceof Error ? anthropic.reason.message : 'Erro ao listar modelos Anthropic.' : null
      },
      gemini: {
        configured: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
        models: gemini.status === 'fulfilled' ? gemini.value : [],
        error: gemini.status === 'rejected' ? gemini.reason instanceof Error ? gemini.reason.message : 'Erro ao listar modelos Gemini.' : null
      }
    }
  };
}
