/**
 * modules/personality/types.ts
 * Personality Engine (estrutura) — Persona AURA, Persona ARGUS,
 * configuração de humor, formalidade, estilo de comunicação e DISC
 * (Work Package 004, escopo item 6).
 */
export type PersonaId = 'aura' | 'argus';

export type FormalityLevel = 'informal' | 'neutro' | 'formal';
export type MoodTone = 'neutro' | 'entusiasmado' | 'sereno' | 'focado';

export interface DiscConfig {
  /** Dominância, Influência, Estabilidade, Conformidade — perfil comportamental do usuário. */
  dominance: number;
  influence: number;
  steadiness: number;
  conscientiousness: number;
}

export interface PersonaDefinition {
  id: PersonaId;
  displayName: string;
  description: string;
  baseTone: string;
  defaultFormality: FormalityLevel;
  defaultMood: MoodTone;
  colorTheme: { primary: string; secondary: string; accent: string };
}

export interface PersonalitySettings {
  userId: string;
  activePersona: PersonaId;
  formality: FormalityLevel;
  mood: MoodTone;
  discProfile?: DiscConfig;
}

export interface PersonaStyleOutput {
  persona: PersonaId;
  systemInstructions: string;
  tone: string;
}
