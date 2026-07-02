/**
 * modules/memory/repository.ts
 * Sprint 004: implementação em memória. Troca futura para Supabase +
 * banco vetorial (pgvector) não deve exigir mudança de interface
 * (IMemoryRepository).
 */
import type { IMemoryRepository } from './interfaces';
import type { MemoryQuery, MemoryRecord } from './types';
import { matchesTextQuery } from './utils';
import { DEFAULT_RECALL_LIMIT } from './constants';

export class InMemoryMemoryRepository implements IMemoryRepository {
  private records: MemoryRecord[] = [];

  async save(record: MemoryRecord): Promise<void> {
    this.records.push(record);
  }

  async findByQuery(query: MemoryQuery): Promise<MemoryRecord[]> {
    return this.records
      .filter((r) => r.userId === query.userId)
      .filter((r) => (query.layers ? query.layers.includes(r.layer) : true))
      .filter((r) => (query.projectId ? r.metadata.projectId === query.projectId : true))
      .filter((r) => matchesTextQuery(r, query.textQuery))
      .slice(0, query.limit ?? DEFAULT_RECALL_LIMIT);
  }

  async delete(memoryId: string): Promise<void> {
    this.records = this.records.filter((r) => r.id !== memoryId);
  }

  async findAllByUser(userId: string): Promise<MemoryRecord[]> {
    return this.records.filter((r) => r.userId === userId);
  }
}

/**
 * Embedding provider stub — Sprint 004 não gera embeddings reais.
 * Mantido aqui para satisfazer IEmbeddingProvider quando conectado.
 */
export class NullEmbeddingProvider {
  async generateEmbedding(text: string) {
    return { memoryId: '', vector: [] as number[], model: 'not_implemented' };
  }
}
