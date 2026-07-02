# AURA / ARGUS - envio pelo GitHub Web

## O que enviar

Envie para o repositório o conteúdo desta pasta, mantendo a estrutura.

Não envie arquivos `.env`, `.env.local`, `node_modules`, `.next` ou arquivos `.log`.

## Passo a passo

1. Crie um repositório vazio no GitHub com o nome `aura-argus`.
2. Descompacte este pacote no computador.
3. Entre na pasta `aura_argus_github_ready`.
4. No GitHub Web, clique em **Add file > Upload files**.
5. Arraste todos os arquivos e pastas desta pasta para o GitHub.
6. Clique em **Commit changes**.
7. Depois conecte esse repositório na Vercel.

## Variáveis na Vercel

Em **Vercel > Project > Settings > Environment Variables**, cadastre:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rbqaspkaytbplgrplelf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_a_anon_key
SUPABASE_SERVICE_ROLE_KEY=cole_a_service_role_key
```

## Testes depois do deploy

- `/api/health` deve retornar `status: ok`.
- `/api/supabase-test` deve retornar os providers cadastrados no schema `ai`.

Se `/api/supabase-test` der erro, normalmente é chave errada ou SQL não executado no Supabase.
