import type { ProfileData } from '@/lib/profile/types';
import { buildIdentityContext } from './context-builder';

export function buildIdentityEngine(email: string, profileInput?: Partial<ProfileData> | null, userId?: string) {
  return buildIdentityContext(email, profileInput, userId);
}

export type { IdentityProfile, IdentityPersona, IdentitySignal, IdentityInference } from './types';
