/**
 * modules/memory/controller.ts
 */
import { MemoryService } from './service';
import type { MemoryQuery, MemoryWriteInput } from './types';

const service = new MemoryService();

export async function rememberHandler(input: MemoryWriteInput) {
  return service.remember(input);
}

export async function recallHandler(query: MemoryQuery) {
  return service.recall(query);
}

export function getMemoryService(): MemoryService {
  return service;
}
