/**
 * modules/conversation/interfaces.ts
 */
import type {
  AppendMessageInput,
  Conversation,
  ConversationMessage,
  ConversationSummary,
  CreateConversationInput
} from './types';

export interface IConversationService {
  createConversation(input: CreateConversationInput): Promise<Conversation>;
  appendMessage(input: AppendMessageInput): Promise<ConversationMessage>;
  getHistory(conversationId: string, limit?: number): Promise<ConversationMessage[]>;
  listConversations(userId: string): Promise<Conversation[]>;
  summarize(conversationId: string): Promise<ConversationSummary>;
  switchPersona(conversationId: string, persona: 'aura' | 'argus'): Promise<Conversation>;
}

export interface IConversationRepository {
  saveConversation(conversation: Conversation): Promise<void>;
  saveMessage(message: ConversationMessage): Promise<void>;
  findConversationById(id: string): Promise<Conversation | null>;
  findMessagesByConversation(conversationId: string, limit?: number): Promise<ConversationMessage[]>;
  findConversationsByUser(userId: string): Promise<Conversation[]>;
  updateConversation(conversation: Conversation): Promise<void>;
}
