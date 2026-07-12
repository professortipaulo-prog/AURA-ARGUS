# AURA_ARGUS_PATCH_129 — BETA_TEST_EMAIL_EXCLUSION

## Objetivo
Adicionar o e-mail de teste que Paulo vai usar
(`profpaulofilho@gmail.com`) à lista de e-mails excluídos da contagem
das 15 vagas do beta, para ele poder testar o cadastro completo em
`/beta` sem gastar uma vaga real.

## Arquivo alterado
- `lib/beta/signup.ts` (lista `TEST_EMAILS`)

## O que NÃO foi alterado
- Nenhuma outra lógica.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando
npm run build           # build completo
```

## Teste funcional recomendado
1. Subir o arquivo.
2. Acessar `/beta` e cadastrar usando `profpaulofilho@gmail.com`.
3. Confirmar que o contador de vagas restantes não diminui.
4. Fazer login com essa conta e conferir a experiência completa do
   aluno beta (Central de Estudos, contagem de 7 dias, etc.).

## Status
Implementado e validado por build/testes.
