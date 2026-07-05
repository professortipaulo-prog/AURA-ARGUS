# AURA_ARGUS_PATCH_060 — MEMORY_COUNTERS_REAL_SOURCE

## Objetivo
Tornar os contadores da página Memória confiáveis, lendo a mesma base usada pelo Memory Engine.

## Escopo
- Não altera interface.
- Não altera CSS.
- Não altera Chat.
- Não altera Landing.
- Ajusta apenas a leitura dos contadores.

## Arquivos alterados
- `lib/memory/server.ts`
- `app/api/memory/status/route.ts`

## Ajustes
- `getMemoryStatus()` passa a usar contagem segura por tabela.
- Contabiliza sessões ativas, mensagens, memórias e projetos.
- Adiciona fallback para mensagens usando `memory_sessions.message_count` quando `memory_messages` não estiver acessível.
- Mantém resposta compatível com a página `/dashboard/memory` existente.

## Teste no site
1. Abrir Chat IA.
2. Enviar uma mensagem simples.
3. Abrir Memória.
4. Validar se Sessões, Mensagens e Memórias exibem valores reais.

## Critério de aceite
- A interface da Memória permanece igual.
- Os contadores não voltam a zero quando existem conversas/memórias salvas.
- O Chat mantém a animação de processamento.
