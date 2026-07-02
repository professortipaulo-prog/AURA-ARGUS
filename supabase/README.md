# Supabase — estrutura reservada

Pasta reservada para migrações SQL e configuração do Supabase
(PostgreSQL + Edge Functions + Auth + Storage), conforme
`COM-004_Stack_Tecnologica`.

Sprint 004 não cria tabelas reais. Tabelas sugeridas pelos módulos do
Núcleo de Inteligência para sprints futuras:

| Módulo | Tabela sugerida |
| --- | --- |
| AI Router | `ai_routing_logs` |
| Conversation Manager | `conversations`, `messages` |
| Memory Retrieval | `memories` (+ extensão `pgvector` para embeddings) |
| Personality Engine | `personality_settings` |
| Workflow Engine | `workflows`, `workflow_steps` |
