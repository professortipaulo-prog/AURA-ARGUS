# PATCH 011 — Autenticação real

Implementa autenticação real com Supabase Auth.

## Entregas
- Login por e-mail/senha.
- Login admin aceitando `paulofilho` como alias para `professortipaulo@gmail.com`.
- Cadastro real via Supabase Auth.
- Criação/atualização de `core.profiles`.
- Criação/atualização da organização padrão AURA/ARGUS.
- Vínculo em `core.organization_members`.
- Proteção de `/dashboard`.
- Proteção de `/api/ai/chat`.
- Logout em `/auth/sign-out`.
- Middleware para refresh de sessão.

## Credencial admin
- Usuário: `paulofilho`
- E-mail: `professortipaulo@gmail.com`
- Senha: cadastrada no Supabase Auth.

## Observação
A senha não é gravada no código. Ela fica no Supabase Auth.
