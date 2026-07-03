# PATCH 010 — Restaura Acesso Admin Temporário

## Objetivo
Restaurar o acesso administrativo pelo usuário definido durante o desenvolvimento, enquanto o Supabase Auth definitivo ainda não está conectado ao formulário.

## Credenciais temporárias
- Usuário: `paulofilho`
- E-mail alternativo: `professortipaulo@gmail.com`
- Senha: `F1lho@tomo2026`

## Arquivo alterado
- `app/login/page.tsx`

## Comportamento
Ao validar as credenciais, a tela grava uma sessão temporária em `localStorage` e redireciona para `/dashboard`.

## Observação
Este patch é provisório. Deve ser substituído pelo módulo de autenticação real com Supabase Auth.
