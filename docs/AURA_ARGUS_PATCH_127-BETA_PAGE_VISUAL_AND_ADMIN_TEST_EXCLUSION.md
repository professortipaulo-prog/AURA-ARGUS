# AURA_ARGUS_PATCH_127 — BETA_PAGE_VISUAL_AND_ADMIN_TEST_EXCLUSION

## Objetivo
Dois ajustes pedidos por Paulo sobre o PATCH_126: (1) a página de
cadastro do beta deveria ter o mesmo visual da landing principal (chuva
de binário estilo matrix), e (2) testar o formulário não deveria gastar
uma das 15 vagas reais.

## 1) Visual — chuva matrix igual à landing
A página `/beta` reaproveita agora o mesmo componente `MatrixRain` e o
mesmo fundo em gradiente (`radial-gradient` ciano/roxo sobre navy escuro)
já usados na landing principal — visualmente consistente com o resto do
site, em vez do gradiente genérico que eu tinha colocado.

## 2) Sua conta não conta como vaga
`getBetaStatus()` agora exclui explicitamente o seu e-mail de
administrador da contagem de vagas usadas — se por acaso uma conta com
esse e-mail tivesse `beta_cohort = true`, ela nunca seria contada contra
o limite de 15.

**Importante saber, com honestidade:** sua conta de dono já existia
antes de qualquer coisa do beta — ela tem `beta_cohort = false` por
padrão, e por isso **já está automaticamente fora** de qualquer limite
de vaga ou prazo de 7 dias, sem precisar de nenhum cadastro novo. Você
já pode entrar direto pelo `/login` normal, com sua conta de sempre, sem
gastar vaga nenhuma — nem precisa passar pelo formulário `/beta`.

Se seu objetivo era especificamente **testar o formulário de cadastro em
si** (não só acessar o painel), aí sim você precisaria usar um e-mail
diferente do seu principal (o Supabase não deixa cadastrar de novo com
um e-mail que já existe). Nesse caso, me diga qual e-mail de teste você
pretende usar que eu adiciono à lista de exclusão também.

## Arquivos alterados
- `app/beta/page.tsx` (fundo com `MatrixRain`, nos 3 estados da página)
- `app/globals.css` (`.aios-beta-shell`, `.aios-beta-bg` — visual igual à
  landing)
- `lib/beta/signup.ts` (exclusão do e-mail admin na contagem)

## O que NÃO foi alterado
- O restante da lógica do PATCH_126 (formulário, LGPD, 7 dias) —
  inalterado.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando
npm run build           # build completo
```

## Teste funcional recomendado
1. Subir os 3 arquivos (não precisa de migração nova).
2. Acessar `/beta` e confirmar visualmente que a chuva de binário
   aparece atrás do formulário, igual à landing.
3. Confirmar que sua conta normal (via `/login`) continua funcionando
   sem nenhuma restrição de vaga ou prazo.

## Status
Implementado e validado por build/testes.
