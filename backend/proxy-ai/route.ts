/**
 * backend/proxy-ai/route.ts
 * Estrutura do proxy seguro de IA (Supabase Edge Function / Next.js
 * Route Handler). Sprint 004: NENHUMA chave real é usada e NENHUMA
 * chamada HTTP a Gemini/Anthropic é feita — apenas a orquestração via
 * AI Router, que retorna status 'not_implemented'.
 *
 * Quando movido para Supabase Edge Functions, este arquivo deve ser
 * adaptado para o formato `Deno.serve(...)`, mantendo a mesma lógica de
 * orquestração (chamar o AI Router, nunca expor GEMINI_API_KEY /
 * ANTHROPIC_API_KEY ao frontend).
 */
import { handleAIRouterRequest } from '../../modules/ai-router';
import type { AIRouterRequest } from '../../modules/ai-router';

export async function handleProxyRequest(request: AIRouterRequest) {
  // A chave de API (GEMINI_API_KEY / ANTHROPIC_API_KEY) é lida somente
  // aqui, no backend, a partir de variáveis de ambiente — nunca no
  // frontend. Sprint 004 não realiza a leitura real ainda.
  return handleAIRouterRequest(request);
}
