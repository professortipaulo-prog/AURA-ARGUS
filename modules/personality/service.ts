/**
 * modules/personality/service.ts
 * Persona AURA/ARGUS, configuração de humor, formalidade, estilo de
 * comunicação e DISC (Work Package 004, escopo item 6).
 */
import type { IPersonalityRepository, IPersonalityService } from './interfaces';
import type { PersonaDefinition, PersonalitySettings, PersonaStyleOutput } from './types';
import { PERSONA_DEFINITIONS, DEFAULT_PERSONA } from './constants';
import { describeDisc, describeFormality, describeMood } from './utils';
import { InMemoryPersonalityRepository } from './repository';

export class PersonalityService implements IPersonalityService {
  constructor(private readonly repository: IPersonalityRepository = new InMemoryPersonalityRepository()) {}

  getPersonaDefinition(personaId: PersonalitySettings['activePersona']): PersonaDefinition {
    return PERSONA_DEFINITIONS[personaId];
  }

  async getSettings(userId: string): Promise<PersonalitySettings> {
    const existing = await this.repository.find(userId);
    if (existing) return existing;

    const persona = PERSONA_DEFINITIONS[DEFAULT_PERSONA];
    const defaults: PersonalitySettings = {
      userId,
      activePersona: DEFAULT_PERSONA,
      formality: persona.defaultFormality,
      mood: persona.defaultMood
    };
    await this.repository.save(defaults);
    return defaults;
  }

  async updateSettings(settings: PersonalitySettings): Promise<PersonalitySettings> {
    await this.repository.save(settings);
    return settings;
  }

  resolveStyle(settings: PersonalitySettings): PersonaStyleOutput {
    const persona = this.getPersonaDefinition(settings.activePersona);
    const systemInstructions = [
      persona.description,
      persona.baseTone,
      describeFormality(settings.formality),
      describeMood(settings.mood),
      describeDisc(settings.discProfile)
    ].join(' ');

    return {
      persona: settings.activePersona,
      systemInstructions,
      tone: `${settings.formality} / ${settings.mood}`
    };
  }
}
