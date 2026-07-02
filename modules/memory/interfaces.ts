/**
 * modules/memory/interfaces.ts
 */
import type { EmbeddingVector, MemoryQuery, MemoryRecord, MemoryWriteInput } from './types';

export interface IMemoryService {
  remember(input: MemoryWriteInput): Promise<MemoryRecord>;
  recall(query: MemoryQuery): Promise<MemoryRecord[]>;
  forget(memoryId: string): Promise<void>;
  exportUserMemory(userId: string): Promise<MemoryRecord[]>;
}

export interface IMemoryRepository {
  save(record: MemoryRecord): Promise<void>;
  findByQuery(query: MemoryQuery): Promise<MemoryRecord[]>;
  delete(memoryId: string): Promise<void>;
  findAllByUser(userId: string): Promise<MemoryRecord[]>;
}

/** Contrato para o futuro serviço de embeddings/banco vetorial. */
export interface IEmbeddingProvider {
  generateEmbedding(text: string): Promise<EmbeddingVector>;
}
