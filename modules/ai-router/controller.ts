/**
 * modules/ai-router/controller.ts
 * Camada fina que será exposta futuramente por uma rota de API
 * (ex: app/api/ai-router/route.ts) ou por Supabase Edge Function.
 * Sprint 004: apenas orquestra a chamada ao service; não há endpoint HTTP ativo.
 */
import { AIRouterService } from './service';
import type { AIRouterRequest, AIRouterResult } from './types';

const service = new AIRouterService();

export async function handleAIRouterRequest(request: AIRouterRequest): Promise<AIRouterResult> {
  return service.execute(request);
}

export function getAIRouterService(): AIRouterService {
  return service;
}
