export type MemoryPersona = 'aura' | 'argus';
export type MemoryRole = 'user' | 'assistant' | 'system';

export type ImportantMemory = {
  id: string;
  kind: string;
  title: string;
  content: string;
  salience: number;
  tags: string[];
  updatedAt?: string;
};

export type RecentMemorySession = {
  id: string;
  title: string;
  summary: string | null;
  messageCount: number;
  lastPersona: MemoryPersona | null;
  lastMessageAt: string | null;
};

export type MemoryContext = {
  importantMemories: ImportantMemory[];
  relevantMemories: ImportantMemory[];
  recentSessions: RecentMemorySession[];
};

export type SaveChatTurnInput = {
  userId: string;
  sessionId?: string | null;
  persona: MemoryPersona;
  userMessage: string;
  assistantMessage: string;
  provider?: string | null;
  model?: string | null;
};
