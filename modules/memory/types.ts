/**
 * modules/memory/types.ts
 * Memory Retrieval — recuperação de memória persistente, busca por
 * contexto e estrutura para embeddings futuros (Sprint-002 §4.1/§4.3).
 */
export type MemoryLayer = 'temporary' | 'session' | 'project' | 'permanent';

export interface MemoryRecord {
  id: string;
  userId: string;
  layer: MemoryLayer;
  content: string;
  /** Metadados mínimos exigidos pelo banco vetorial (Sprint-002 §4.3). */
  metadata: MemoryMetadata;
  createdAt: string;
}

export interface MemoryMetadata {
  projectId?: string;
  origin: string;
  contentType: 'fact' | 'preference' | 'decision' | 'artifact_reference' | 'other';
  version: number;
  sensitivity: 'public' | 'internal' | 'sensitive';
  permissions: string[];
}

export interface MemoryQuery {
  userId: string;
  layers?: MemoryLayer[];
  projectId?: string;
  /** Sprint 004: busca textual simples; busca vetorial fica para sprint futura. */
  textQuery?: string;
  limit?: number;
}

export interface MemoryWriteInput {
  userId: string;
  layer: MemoryLayer;
  content: string;
  metadata: Partial<MemoryMetadata> & { origin: string; contentType: MemoryMetadata['contentType'] };
}

/** Estrutura reservada para quando o banco vetorial for conectado. */
export interface EmbeddingVector {
  memoryId: string;
  /** Sprint 004: vetor sempre vazio — geração real de embeddings é futura. */
  vector: number[];
  model: string;
}
