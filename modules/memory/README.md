# Módulo: Memory Retrieval

Recuperação de memória persistente por camada (temporária, sessão,
projeto, permanente), busca por contexto e estrutura para embeddings
futuros (Sprint-002 §4.1/§4.3).

## Status — Sprint 004

- [x] Escrita e leitura de memória por camada e por usuário.
- [x] Metadados mínimos exigidos pelo banco vetorial (origem, tipo,
      versão, sensibilidade, permissões).
- [x] Estrutura para embeddings (`IEmbeddingProvider`, `NullEmbeddingProvider`).
- [x] Exportação de memória por usuário (controle do usuário / LGPD).
- [ ] Banco vetorial real e busca por similaridade — **fora de escopo
      desta sprint**.

## Pendências técnicas

- Conectar `IEmbeddingProvider` a um provedor real de embeddings.
- Substituir `InMemoryMemoryRepository` por Supabase + pgvector.
- Implementar exclusão em cascata e auditoria de exportação/exclusão
  (requisito LGPD).
