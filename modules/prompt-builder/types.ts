/**
 * modules/prompt-builder/types.ts
 * Montagem do prompt final: System Prompt, Context Prompt e User Prompt
 * (Sprint-002 §4.5).
 */
import type { BuiltContext } from '../context-builder/types';

export interface PersonaPromptConfig {
  persona: 'aura' | 'argus';
  systemInstructions: string;
  tone: string;
}

export interface PromptBuildRequest {
  persona: PersonaPromptConfig;
  builtContext: BuiltContext;
  userMessage: string;
  /** Restrições de segurança a incluir explicitamente no prompt final. */
  safetyConstraints?: string[];
  /** Formato esperado da resposta (texto livre, JSON, markdown, etc.). */
  expectedFormat?: string;
}

export interface BuiltPrompt {
  systemPrompt: string;
  contextPrompt: string;
  userPrompt: string;
}
