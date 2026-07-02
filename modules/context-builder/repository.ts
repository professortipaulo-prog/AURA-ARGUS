/**
 * modules/context-builder/repository.ts
 * Sprint 004: fonte de dados stub (retorna null/vazio). A integração
 * real consultará User Profile, Knowledge Hub e Memory Retrieval.
 */
import type { IContextDataSource } from './interfaces';
import type { BuiltContext } from './types';

export class StubContextDataSource implements IContextDataSource {
  async getUserContext(userId: string): Promise<BuiltContext['user']> {
    return { userId };
  }

  async getProjectContext(projectId: string): Promise<BuiltContext['project']> {
    return { projectId };
  }

  async getConversationContext(conversationId: string): Promise<BuiltContext['conversation']> {
    return { conversationId, recentMessages: [] };
  }
}
