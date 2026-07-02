/**
 * modules/memory/utils.ts
 */
import type { MemoryRecord } from './types';

export function generateMemoryId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Filtro textual simples (case-insensitive substring). Sprint 004. */
export function matchesTextQuery(record: MemoryRecord, textQuery?: string): boolean {
  if (!textQuery) return true;
  return record.content.toLowerCase().includes(textQuery.toLowerCase());
}
