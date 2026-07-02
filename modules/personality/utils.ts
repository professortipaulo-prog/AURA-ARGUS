/**
 * modules/personality/utils.ts
 */
import type { DiscConfig, FormalityLevel, MoodTone } from './types';

export function describeFormality(level: FormalityLevel): string {
  switch (level) {
    case 'informal':
      return 'Use linguagem casual e próxima, mantendo profissionalismo.';
    case 'formal':
      return 'Use linguagem formal e precisa.';
    case 'neutro':
    default:
      return 'Use linguagem neutra, clara e objetiva.';
  }
}

export function describeMood(mood: MoodTone): string {
  switch (mood) {
    case 'entusiasmado':
      return 'Tom energético e motivador.';
    case 'sereno':
      return 'Tom calmo e acolhedor.';
    case 'focado':
      return 'Tom direto e orientado a resultado.';
    case 'neutro':
    default:
      return 'Tom equilibrado.';
  }
}

export function describeDisc(disc?: DiscConfig): string {
  if (!disc) return 'Perfil DISC ainda não configurado pelo usuário.';
  return `DISC — Dominância: ${disc.dominance}, Influência: ${disc.influence}, Estabilidade: ${disc.steadiness}, Conformidade: ${disc.conscientiousness}.`;
}
