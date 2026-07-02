/**
 * lib/ai/providers/gemini.ts
 * Adapter real para Google Gemini. A chave
 * (GOOGLE_GENERATIVE_AI_API_KEY) é lida exclusivamente aqui, em código
 * de servidor — nunca é enviada ao frontend nem incluída em respostas
 * de status.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro';

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

  async send(message: string, model?: string): Promise<string> {
    const client = getClient();
    const resolvedModel = model || DEFAULT_MODEL;

    const generativeModel = client.getGenerativeModel({ model: resolvedModel });
    const result = await generativeModel.generateContent(message);
    const text = result.response.text();

    if (!text) {
      throw new Error('Resposta do Gemini sem conteúdo de texto.');
    }
    return text;
  }
};
