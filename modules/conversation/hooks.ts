/**
 * modules/conversation/hooks.ts
 * Hook de cliente React para a UI de Chat consumir o histórico de
 * conversa. Sprint 004: estado local apenas, sem persistência remota.
 */
'use client';

import { useCallback, useState } from 'react';
import type { ConversationMessage } from './types';

export function useConversationHistory() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  const addLocalMessage = useCallback((message: ConversationMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, addLocalMessage, clear };
}
