/**
 * modules/context-builder/utils.ts
 */
import type { MemoryContextFragment } from './types';

/** Estimativa simplificada de tokens (≈ 4 caracteres por token). Sprint 004. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function sortByRelevance(fragments: MemoryContextFragment[]): MemoryContextFragment[] {
  return [...fragments].sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
}
