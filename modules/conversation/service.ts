/**
 * modules/conversation/service.ts
 * Gerenciamento de conversas: histórico, contexto de sessão e suporte a
 * múltiplas conversas simultâneas por usuário (Sprint-002 §2.2).
 */
import type { IConversationRepository, IConversationService } from './interfaces';
import type {
  AppendMessageInput,
  Conversation,
  ConversationMessage,
  ConversationSummary,
  CreateConversationInput
} from './types';
import { DEFAULT_HISTORY_LIMIT, DEFAULT_CONVERSATION_TITLE } from './constants';
import { generateConversationId, generateMessageId, nowISO } from './utils';
import { InMemoryConversationRepository } from './repository';

export class ConversationService implements IConversationService {
  constructor(private readonly repository: IConversationRepository = new InMemoryConversationRepository()) {}

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const conversation: Conversation = {
      id: generateConversationId(),
      userId: input.userId,
      activePersona: input.activePersona,
      title: input.title ?? DEFAULT_CONVERSATION_TITLE,
      projectId: input.projectId,
      createdAt: nowISO(),
      updatedAt: nowISO()
    };
    await this.repository.saveConversation(conversation);
    return conversation;
  }

  async appendMessage(input: AppendMessageInput): Promise<ConversationMessage> {
    const conversation = await this.repository.findConversationById(input.conversationId);
    if (!conversation) {
      throw new Error(`Conversa não encontrada: ${input.conversationId}`);
    }

    const message: ConversationMessage = {
      id: generateMessageId(),
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      createdAt: nowISO()
    };

    await this.repository.saveMessage(message);
    await this.repository.updateConversation({ ...conversation, updatedAt: nowISO() });
    return message;
  }

  async getHistory(conversationId: string, limit: number = DEFAULT_HISTORY_LIMIT): Promise<ConversationMessage[]> {
    return this.repository.findMessagesByConversation(conversationId, limit);
  }

  async listConversations(userId: string): Promise<Conversation[]> {
    return this.repository.findConversationsByUser(userId);
  }

  async summarize(conversationId: string): Promise<ConversationSummary> {
    const messages = await this.repository.findMessagesByConversation(conversationId);
    return {
      conversationId,
      messageCount: messages.length,
      lastMessageAt: messages.length > 0 ? messages[messages.length - 1]?.createdAt ?? null : null
    };
  }

  async switchPersona(conversationId: string, persona: 'aura' | 'argus'): Promise<Conversation> {
    const conversation = await this.repository.findConversationById(conversationId);
    if (!conversation) {
      throw new Error(`Conversa não encontrada: ${conversationId}`);
    }
    const updated: Conversation = { ...conversation, activePersona: persona, updatedAt: nowISO() };
    await this.repository.updateConversation(updated);
    return updated;
  }
}
