/**
 * modules/conversation/types.ts
 * Tipos do Conversation Manager — histórico, contexto de sessão e
 * preparação para múltiplas conversas simultâneas (Sprint-002 §2.2).
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  /** Persona ativa nesta conversa (ver Personality Engine). */
  activePersona: 'aura' | 'argus';
  title: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  conversationId: string;
  messageCount: number;
  lastMessageAt: string | null;
}

export interface CreateConversationInput {
  userId: string;
  activePersona: 'aura' | 'argus';
  title?: string;
  projectId?: string;
}

export interface AppendMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
}
