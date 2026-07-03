/**
 * Provider real da Anthropic.
 * O modelo deve chegar já resolvido pelo AI Provider Manager.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || 'auto';

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

  async send(message: string, model: string, systemPrompt?: string): Promise<string> {
    const client = getClient();

    const response = await client.messages.create({
      model,
      max_tokens: 1200,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [{ role: 'user', content: message }]
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Resposta da Anthropic sem conteúdo de texto.');
    }
    return textBlock.text;
  }
};
