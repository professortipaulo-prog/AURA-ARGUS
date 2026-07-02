/**
 * modules/personality/controller.ts
 */
import { PersonalityService } from './service';
import type { PersonalitySettings } from './types';

const service = new PersonalityService();

export async function getPersonalitySettingsHandler(userId: string) {
  return service.getSettings(userId);
}

export async function updatePersonalitySettingsHandler(settings: PersonalitySettings) {
  return service.updateSettings(settings);
}

export function getPersonalityService(): PersonalityService {
  return service;
}
