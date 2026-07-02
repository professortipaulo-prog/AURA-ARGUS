/**
 * modules/ai-router/hooks.ts
 * Hook de cliente (React) para uso futuro no Chat/Conversation UI.
 * Sprint 004: não faz fetch real a nenhuma rota; serve apenas de contrato
 * de interface para os componentes de frontend consumirem.
 */
'use client';

import { useCallback, useState } from 'react';
import type { AIRouterRequest, AIRouterResult } from './types';

interface UseAIRouterState {
  isLoading: boolean;
  error: string | null;
  lastResult: AIRouterResult | null;
}

export function useAIRouter() {
  const [state, setState] = useState<UseAIRouterState>({
    isLoading: false,
    error: null,
    lastResult: null
  });

  const send = useCallback(async (_request: AIRouterRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    // Sprint 004: integração real (fetch para endpoint do AI Router) será
    // conectada em sprint futura, junto com Gemini/Anthropic.
    setState({
      isLoading: false,
      error: 'AI Router ainda não conectado a um provedor real (Sprint 004).',
      lastResult: null
    });
  }, []);

  return { ...state, send };
}
