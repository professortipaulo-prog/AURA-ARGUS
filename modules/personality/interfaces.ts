/**
 * modules/personality/interfaces.ts
 */
import type { PersonaDefinition, PersonalitySettings, PersonaStyleOutput } from './types';

export interface IPersonalityService {
  getPersonaDefinition(personaId: PersonalitySettings['activePersona']): PersonaDefinition;
  getSettings(userId: string): Promise<PersonalitySettings>;
  updateSettings(settings: PersonalitySettings): Promise<PersonalitySettings>;
  /** Gera as instruções de estilo para o Prompt Builder consumir. */
  resolveStyle(settings: PersonalitySettings): PersonaStyleOutput;
}

export interface IPersonalityRepository {
  find(userId: string): Promise<PersonalitySettings | null>;
  save(settings: PersonalitySettings): Promise<void>;
}
