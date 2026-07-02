/**
 * modules/context-builder/interfaces.ts
 */
import type { BuiltContext, ContextBuildRequest, MemoryContextFragment } from './types';

export interface IContextBuilderService {
  /**
   * Seleciona contexto relevante aplicando filtros por usuário, projeto,
   * recência, similaridade, permissão e limite de tokens
   * (Sprint-002 §4.4).
   */
  buildContext(request: ContextBuildRequest): Promise<BuiltContext>;
  rankAndCompact(fragments: MemoryContextFragment[], maxTokens: number): MemoryContextFragment[];
}

/** Fonte de dados de usuário/projeto/conversa consumida pelo Context Builder. */
export interface IContextDataSource {
  getUserContext(userId: string): Promise<BuiltContext['user']>;
  getProjectContext(projectId: string): Promise<BuiltContext['project']>;
  getConversationContext(conversationId: string): Promise<BuiltContext['conversation']>;
}
