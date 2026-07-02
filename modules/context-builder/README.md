# Módulo: Context Builder

Seleciona o contexto relevante antes da chamada de IA, aplicando filtros
por usuário, projeto, recência, similaridade, permissão e limite de
tokens (Sprint-002 §4.4).

## Status — Sprint 004

- [x] Pipeline de construção de contexto (usuário, projeto, conversa).
- [x] Ranqueamento e compactação por orçamento de tokens.
- [x] Estimativa simplificada de tokens.
- [ ] Busca por similaridade em banco vetorial real — depende do Memory
      Retrieval (fora de escopo nesta sprint).

## Pendências técnicas

- Substituir `StubContextDataSource` por integração com User Profile,
  Knowledge Hub e Memory Retrieval reais.
- Implementar estimativa de tokens precisa (tokenizer real do provedor).
- Aplicar filtros de permissão/sensibilidade nos fragmentos de memória.
