export type MemoryPersona = 'aura' | 'argus';
export type MemoryRole = 'user' | 'assistant' | 'system';

export type ImportantMemory = {
  id: string;
  kind: string;
  title: string;
  content: string;
  salience: number;
  tags: string[];
  projectId?: string | null;
  updatedAt?: string | null;
};

export type RecentMemorySession = {
  id: string;
  title: string;
  summary: string | null;
  messageCount: number;
  lastPersona: MemoryPersona | null;
  lastMessageAt: string | null;
  projectId?: string | null;
};

export type ProjectMemoryInfo = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memoryCount?: number;
  sessionCount?: number;
} | null;

export type MemoryContext = {
  project: ProjectMemoryInfo;
  projectMemories: ImportantMemory[];
  importantMemories: ImportantMemory[];
  relevantMemories: ImportantMemory[];
  recentSessions: RecentMemorySession[];
};

export type SaveChatTurnInput = {
  userId: string;
  userEmail?: string | null;
  sessionId?: string | null;
  projectId?: string | null;
  persona: MemoryPersona;
  userMessage: string;
  assistantMessage: string;
  provider?: string | null;
  model?: string | null;
};
