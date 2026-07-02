/**
 * modules/memory/service.ts
 * Memory Retrieval: escreve e recupera memória persistente por camada
 * (temporária, sessão, projeto, permanente) e prepara estrutura para
 * embeddings/banco vetorial futuro (Sprint-002 §4.1/§4.3).
 */
import type { IMemoryRepository, IMemoryService } from './interfaces';
import type { MemoryQuery, MemoryRecord, MemoryWriteInput } from './types';
import { generateMemoryId, nowISO } from './utils';
import { DEFAULT_SENSITIVITY } from './constants';
import { InMemoryMemoryRepository } from './repository';

export class MemoryService implements IMemoryService {
  constructor(private readonly repository: IMemoryRepository = new InMemoryMemoryRepository()) {}

  async remember(input: MemoryWriteInput): Promise<MemoryRecord> {
    const record: MemoryRecord = {
      id: generateMemoryId(),
      userId: input.userId,
      layer: input.layer,
      content: input.content,
      metadata: {
        origin: input.metadata.origin,
        contentType: input.metadata.contentType,
        version: input.metadata.version ?? 1,
        sensitivity: input.metadata.sensitivity ?? DEFAULT_SENSITIVITY,
        permissions: input.metadata.permissions ?? [],
        projectId: input.metadata.projectId
      },
      createdAt: nowISO()
    };
    await this.repository.save(record);
    return record;
  }

  async recall(query: MemoryQuery): Promise<MemoryRecord[]> {
    // Sprint 004: busca textual simples. Busca por similaridade semântica
    // (embeddings + banco vetorial) será conectada em sprint futura.
    return this.repository.findByQuery(query);
  }

  async forget(memoryId: string): Promise<void> {
    await this.repository.delete(memoryId);
  }

  async exportUserMemory(userId: string): Promise<MemoryRecord[]> {
    // Atende ao requisito de controle do usuário (revisar/exportar/apagar).
    return this.repository.findAllByUser(userId);
  }
}
