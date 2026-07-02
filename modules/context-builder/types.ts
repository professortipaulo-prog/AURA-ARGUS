/**
 * modules/context-builder/types.ts
 * Construção automática de contexto: usuário, projeto e conversa
 * (Sprint-002 §4.4).
 */
export interface UserContextFragment {
  userId: string;
  displayName?: string;
  preferences?: Record<string, unknown>;
  discProfile?: Record<string, unknown>;
}

export interface ProjectContextFragment {
  projectId: string;
  projectName?: string;
  activeGoals?: string[];
}

export interface ConversationContextFragment {
  conversationId: string;
  recentMessages: { role: string; content: string }[];
}

export interface MemoryContextFragment {
  source: 'temporary' | 'session' | 'project' | 'permanent' | 'vector';
  content: string;
  relevanceScore?: number;
}

export interface ContextBuildRequest {
  userId: string;
  conversationId: string;
  projectId?: string;
  taskType: 'chat' | 'document_analysis' | 'action' | 'teaching';
  /** Limite de tokens disponível para o contexto (Sprint-002 §4.4). */
  maxTokens: number;
}

export interface BuiltContext {
  user: UserContextFragment | null;
  project: ProjectContextFragment | null;
  conversation: ConversationContextFragment | null;
  memoryFragments: MemoryContextFragment[];
  /** Estimativa de tokens do contexto compactado, respeitando maxTokens. */
  estimatedTokens: number;
}
