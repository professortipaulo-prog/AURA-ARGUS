/**
 * Provider real do Google Gemini.
 * O modelo deve chegar já resolvido pelo AI Provider Manager.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.GEMINI_DEFAULT_MODEL || 'auto';

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY não configurada.');
  }
  return new GoogleGenerativeAI(apiKey);
}

export const geminiProvider: AIProviderAdapter = {
  id: 'gemini',
  defaultModel: DEFAULT_MODEL,

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  },

  async send(message: string, model: string, systemPrompt?: string): Promise<string> {
    const client = getClient();
    const generativeModel = client.getGenerativeModel({ model, ...(systemPrompt ? { systemInstruction: systemPrompt } : {}) });
    const result = await generativeModel.generateContent(message);
    const text = result.response.text();

    if (!text) {
      throw new Error('Resposta do Gemini sem conteúdo de texto.');
    }
    return text;
  }
};
