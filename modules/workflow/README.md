# Módulo: Workflow Engine

Estrutura de planejamento, execução, monitoramento e finalização de
tarefas multi-etapas (Work Package 004, escopo item 7). Serve de base
para o futuro Action Manager (Sprint-002 §5), que executará ações reais
por trás deste ciclo de vida.

## Status — Sprint 004

- [x] Planejamento de workflow com etapas (`plan`).
- [x] Início de execução (`start`).
- [x] Avanço de etapas com status e tratamento de erro (`advanceStep`).
- [x] Monitoramento (`monitor`).
- [x] Finalização com detecção de falha (`finalize`).
- [ ] Execução real de ações externas — **fora de escopo** (Action
      Manager, integrações Google/Microsoft/WhatsApp/GitHub).

## Pendências técnicas

- Conectar ao futuro Action Manager para execução real de etapas
  (Sprint-002 §5).
- Persistir workflows em Supabase (tabelas `workflows`, `workflow_steps`).
- Implementar `Confirmation Layer` para etapas com `requiresConfirmation: true`.
