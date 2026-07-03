# PATCH 012 — Correção do login e schema core

## Correções

1. Remove a exposição textual do usuário administrativo na tela de login.
2. Corrige o bloqueio de login causado por `Invalid schema: core`.
3. Permite login mesmo quando o schema `core` ainda não está exposto na API do Supabase.
4. Mantém fallback seguro de sessão para o administrador pelo e-mail cadastrado no Supabase Auth.

## Observação importante

O erro `Invalid schema: core` não é erro de senha. Ele ocorre porque o Supabase Auth autenticou, mas a aplicação tentou gravar dados em `core.profiles` via API e o schema `core` não está exposto nas configurações da API.

Para sincronização completa de perfil, organização e permissões, o schema `core` deve ser exposto depois em:

Supabase → Project Settings → API → Exposed schemas

Adicionar:

```text
core
```

Enquanto isso, este patch libera o acesso ao dashboard após login válido.
