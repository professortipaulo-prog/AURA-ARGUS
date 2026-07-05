export type MemoryPersona = 'aura' | 'argus';
export type MemoryProvider = 'anthropic' | 'gemini';

export type ChatPersistenceInput = {
  userId: string;
  organizationId: string | null;
  projectId?: string | null;
  sessionId?: string | null;
  persona: MemoryPersona;
  provider: MemoryProvider;
  model: string;
  userMessage: string;
  assistantMessage: string;
  latencyMs?: number | null;
};

export type PersistedChatTurn = {
  sessionId: string | null;
  userMessageSaved: boolean;
  assistantMessageSaved: boolean;
  memorySaved: boolean;
  error: string | null;
};

export type MemoryOverview = {
  sessions: number;
  messages: number;
  memories: number;
  lastActivity: string | null;
};

export type ProjectMemoryContext = {
  items: Array<{
    title: string | null;
    content: string;
    type: string;
    createdAt: string | null;
  }>;
};

export type TemporalContext = {
  nowIso: string;
  datePtBr: string;
  timePtBr: string;
  timezone: string;
  minutesUntilEndOfDay: number;
  hoursUntilEndOfDay: number;
};
