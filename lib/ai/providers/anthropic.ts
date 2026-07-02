/**
 * lib/ai/providers/anthropic.ts
 * Adapter real para Anthropic Claude. A chave (ANTHROPIC_API_KEY) é lida
 * exclusivamente aqui, em código de servidor — nunca é enviada ao
 * frontend nem incluída em respostas de status.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || 'claude-3-5-sonnet-latest';

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada.');
  }
  return new Anthropic({ apiKey });
}

export const anthropicProvider: AIProviderAdapter = {
  id: 'anthropic',
  defaultModel: DEFAULT_MODEL,

  isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async send(message: string, model?: string): Promise<string> {
    const client = getClient();
    const resolvedModel = model || DEFAULT_MODEL;

    const response = await client.messages.create({
      model: resolvedModel,
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }]
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Resposta da Anthropic sem conteúdo de texto.');
    }
    return textBlock.text;
  }
};
