/**
 * modules/personality/hooks.ts
 * Hook de cliente React para alternar entre AURA/ARGUS na UI
 * (botão "seletor AURA/ARGUS" do dashboard). Estado local nesta sprint.
 */
'use client';

import { useState } from 'react';
import type { PersonaId } from './types';
import { PERSONA_DEFINITIONS, DEFAULT_PERSONA } from './constants';

export function usePersonaSelector(initial: PersonaId = DEFAULT_PERSONA) {
  const [personaId, setPersonaId] = useState<PersonaId>(initial);
  return {
    personaId,
    persona: PERSONA_DEFINITIONS[personaId],
    setPersonaId
  };
}
