# Revisão técnica - AURA/ARGUS para GitHub

## Base adotada

A base principal adotada foi `aura-argus-sprint004.zip`, por estar mais alinhada ao núcleo de inteligência do projeto.

## Ajustes aplicados

- Removido `tsconfig.tsbuildinfo`, pois é arquivo gerado localmente.
- `.gitignore` ampliado para impedir envio de `.env.local`, `.next`, `node_modules`, logs e arquivos temporários.
- `.env.example` atualizado com a URL real do Supabase e placeholders para as chaves.
- Dependências Supabase adicionadas ao `package.json`.
- Criados clientes Supabase em `lib/supabase`.
- Criada rota `/api/health` para teste básico de deploy.
- Criada rota `/api/supabase-test` para validar conexão com o banco definitivo.
- SQL definitivo ARQ-DB-001 copiado para `supabase/migrations` e `database`.
- Criado guia `README_GITHUB_UPLOAD.md` para envio pelo GitHub Web.

## Observações importantes

Esta versão está pronta para versionamento e deploy inicial. O banco definitivo já está no Supabase e o projeto local precisa apenas das variáveis de ambiente corretas.

A rota `/api/supabase-test` usa `SUPABASE_SERVICE_ROLE_KEY`; portanto, essa chave deve ficar somente na Vercel e no `.env.local`, nunca no GitHub.
