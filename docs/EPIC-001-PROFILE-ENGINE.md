# EPIC-001 — Profile Engine

## Entrega
Implementa o módulo `/dashboard/profile` para cadastrar o perfil inteligente do usuário.

## Inclui
- Wizard com 8 etapas:
  1. Dados pessoais
  2. Dados profissionais
  3. Perfil comportamental
  4. Objetivos
  5. Rotina
  6. Ferramentas
  7. Conhecimentos
  8. Preferências da IA
- API `/api/profile` com GET e PUT.
- Geração de `user_context.json` para uso futuro pelo Prompt Builder.
- Migration `0002_profile_engine.sql`.
- Link `Perfil` no menu lateral.

## Antes de usar em produção
Rodar no Supabase SQL Editor:

```sql
-- conteúdo do arquivo supabase/migrations/0002_profile_engine.sql
```

## Validação
- `npm run build` executado com sucesso.
