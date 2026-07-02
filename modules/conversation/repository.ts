/**
 * modules/conversation/repository.ts
 * Sprint 004: implementação em memória. Troca futura para Supabase
 * (tabelas `conversations` e `messages`) não deve exigir mudança de
 * interface (IConversationRepository).
 */
import type { IConversationRepository } from './interfaces';
import type { Conversation, ConversationMessage } from './types';

export class InMemoryConversationRepository implements IConversationRepository {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, ConversationMessage[]>();

  async saveConversation(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
  }

  async saveMessage(message: ConversationMessage): Promise<void> {
    const list = this.messages.get(message.conversationId) ?? [];
    list.push(message);
    this.messages.set(message.conversationId, list);
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async findMessagesByConversation(conversationId: string, limit?: number): Promise<ConversationMessage[]> {
    const list = this.messages.get(conversationId) ?? [];
    return limit ? list.slice(-limit) : list;
  }

  async findConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter((c) => c.userId === userId);
  }

  async updateConversation(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }
}
