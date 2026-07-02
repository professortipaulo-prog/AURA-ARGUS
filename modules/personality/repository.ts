/**
 * modules/personality/repository.ts
 * Sprint 004: implementação em memória. Troca futura para Supabase
 * (tabela `personality_settings`) não deve exigir mudança de interface.
 */
import type { IPersonalityRepository } from './interfaces';
import type { PersonalitySettings } from './types';

export class InMemoryPersonalityRepository implements IPersonalityRepository {
  private settings = new Map<string, PersonalitySettings>();

  async find(userId: string): Promise<PersonalitySettings | null> {
    return this.settings.get(userId) ?? null;
  }

  async save(settings: PersonalitySettings): Promise<void> {
    this.settings.set(settings.userId, settings);
  }
}
