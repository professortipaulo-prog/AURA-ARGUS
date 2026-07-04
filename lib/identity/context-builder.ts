import { buildUserContext, calculateCompletion, mergeProfile } from '@/lib/profile/context';
import type { ProfileData } from '@/lib/profile/types';
import { buildContextSignals, buildLearnedPreferences, inferIdentityPatterns } from './personality-builder';
import { buildAuraInstruction, buildArgusInstruction, buildSystemPrompt } from './prompt-builder';
import type { IdentityProfile } from './types';

function text(value?: string | null) {
  return (value ?? '').trim();
}

function join(values: Array<string | null | undefined>, fallback = 'não informado') {
  const filtered = values.map(text).filter(Boolean);
  return filtered.length ? filtered.join(' · ') : fallback;
}

function buildSummary(profile: IdentityProfile['context']) {
  const name = profile.identity.preferredName || profile.identity.fullName || profile.identity.email;
  const professional = join([profile.professional.title, profile.professional.company, profile.professional.area]);
  const goals = profile.goals.categories.length ? profile.goals.categories.join(', ') : 'objetivos ainda não detalhados';
  const tools = profile.tools.selected.length ? profile.tools.selected.slice(0, 10).join(', ') : 'ferramentas ainda não conectadas';
  return `${name} atua em ${professional}. Objetivos principais: ${goals}. Ferramentas declaradas: ${tools}. Prefere resposta ${profile.aiPreferences.responseStyle}, tom ${profile.aiPreferences.tone} e comunicação ${profile.behavior.communicationStyle}.`;
}

function buildGaps(profile: ProfileData): string[] {
  const gaps: string[] = [];
  if (!profile.personal.preferredName && !profile.personal.fullName) gaps.push('Nome preferido');
  if (!profile.professional.title) gaps.push('Cargo/função');
  if (!profile.professional.company) gaps.push('Empresa/organização');
  if (!profile.professional.area) gaps.push('Área principal');
  if (!profile.goals.expectedSupport) gaps.push('Expectativa de apoio da AURA/ARGUS');
  if (!profile.tools.selected.length) gaps.push('Ferramentas usadas');
  if (!profile.routine.activeDays.length) gaps.push('Rotina de trabalho/estudo');
  return gaps;
}

export function buildIdentityContext(email: string, profileInput?: Partial<ProfileData> | null, userId?: string): IdentityProfile {
  const profile = mergeProfile(profileInput);
  const context = buildUserContext(email, profile);
  const completion = calculateCompletion(profile);
  const inferences = inferIdentityPatterns(context);
  const learnedPreferences = buildLearnedPreferences(context);
  const signals = buildContextSignals(context);
  const gaps = buildGaps(profile);
  const summary = buildSummary(context);
  const base: Omit<IdentityProfile, 'auraInstruction' | 'argusInstruction' | 'systemPrompt'> = {
    userId,
    email,
    context,
    completion,
    summary,
    signals,
    inferences,
    learnedPreferences,
    gaps
  };
  const auraInstruction = buildAuraInstruction(base as IdentityProfile);
  const argusInstruction = buildArgusInstruction(base as IdentityProfile);
  const systemPrompt = buildSystemPrompt({ ...(base as IdentityProfile), auraInstruction, argusInstruction, systemPrompt: '' });
  return { ...base, auraInstruction, argusInstruction, systemPrompt };
}
