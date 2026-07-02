# Módulo: Personality Engine

Define as personas AURA e ARGUS e a configuração de humor, formalidade,
estilo de comunicação e perfil DISC (Work Package 004, escopo item 6).

## Status — Sprint 004

- [x] Definições base de persona (AURA / ARGUS), com tema de cor.
- [x] Configuração de formalidade e humor.
- [x] Estrutura para perfil DISC do usuário.
- [x] `resolveStyle()` gera instruções de estilo consumidas pelo Prompt
      Builder.
- [x] Hook `usePersonaSelector` para o seletor AURA/ARGUS no dashboard.

## Pendências técnicas

- Persistir `PersonalitySettings` em Supabase (tabela `personality_settings`).
- Conectar `discProfile` ao formulário de onboarding (GPT-03).
- Permitir aprendizagem contínua de formalidade/humor a partir de
  feedback explícito do usuário (Manual de Memória e Personalidade).
