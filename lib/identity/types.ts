import type { UserContext } from '@/lib/profile/types';

export type IdentityPersona = 'aura' | 'argus';
export type IdentityStrength = 'high' | 'medium' | 'low';
export type IdentityTone = 'estrategico' | 'operacional' | 'consultivo' | 'tecnico' | 'didatico';

export type IdentitySignal = {
  label: string;
  value: string;
  strength: IdentityStrength;
  source: 'profile' | 'memory' | 'inference' | 'default';
};

export type IdentityInference = {
  professionalArchetype: string;
  communicationPattern: string;
  decisionStyle: string;
  autonomyLevel: string;
  deliveryPreference: string;
  riskAttention: string;
};

export type IdentityProfile = {
  userId?: string;
  email: string;
  context: UserContext;
  completion: number;
  summary: string;
  signals: IdentitySignal[];
  inferences: IdentityInference;
  learnedPreferences: string[];
  gaps: string[];
  auraInstruction: string;
  argusInstruction: string;
  systemPrompt: string;
  updatedAt?: string;
};

export type PromptBuildInput = {
  persona: IdentityPersona;
  identity: IdentityProfile | null;
  memoryPrompt?: string;
  extraSystemPrompt?: string;
};
