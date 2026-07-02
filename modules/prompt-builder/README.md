# Módulo: Prompt Builder

Monta o prompt final enviado ao AI Router: instruções do sistema,
objetivo da tarefa, contexto recuperado, preferências do usuário,
restrições de segurança, formato esperado e histórico essencial
(Sprint-002 §4.5).

## Status — Sprint 004

- [x] Montagem de System Prompt a partir da persona ativa.
- [x] Formatação do Context Prompt a partir do `BuiltContext`.
- [x] Inclusão de restrições de segurança padrão.
- [x] Estrutura para templates de prompt versionados (`repository.ts`).
- [ ] Templates persistidos em Supabase — pendente.

## Pendências técnicas

- Persistir templates de prompt versionados por persona/tarefa.
- Integrar com o Personality Engine para humor/formalidade dinâmicos.
- Validar limite de tokens do prompt final antes de enviar ao AI Router.
