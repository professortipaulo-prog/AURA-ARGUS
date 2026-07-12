# AURA_ARGUS_PATCH_128 — BETA_PAGE_LOGIN_LINK

## Objetivo
Corrigir o problema reportado: a página `/beta` só tinha formulário de
cadastro, sem nenhum caminho para quem já tem conta ir direto pro login
— por isso, ao tentar usar um e-mail já cadastrado (ex: a própria conta
de dono do Paulo), o sistema só dizia "e-mail já em uso", sem indicar o
que fazer.

## O que foi corrigido
1. Link "Já tem uma conta? Entrar" adicionado nos dois estados da
   página onde fazia falta: no formulário normal, e na tela de "vagas
   encerradas".
2. Mensagem de erro melhorada: quando o cadastro falha especificamente
   porque o e-mail já existe, a mensagem agora diz claramente "Este
   e-mail já tem uma conta. Se já é seu, é só entrar em vez de cadastrar
   de novo." — em vez do erro genérico anterior.

## Arquivos alterados
- `app/beta/page.tsx`
- `lib/beta/signup.ts`

## O que NÃO foi alterado
- O restante do formulário e da lógica de cadastro — inalterados.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando
npm run build           # build completo
```

## Teste funcional recomendado
1. Subir os 2 arquivos.
2. Acessar `/beta` e confirmar que aparece o link "Entrar" abaixo do
   botão de cadastro.
3. Tentar cadastrar com um e-mail que já existe e confirmar que a
   mensagem de erro agora orienta a usar o login.

## Status
Implementado e validado por build/testes.
