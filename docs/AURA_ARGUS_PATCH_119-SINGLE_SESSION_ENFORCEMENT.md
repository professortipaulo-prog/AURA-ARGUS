# AURA_ARGUS_PATCH_119 — SINGLE_SESSION_ENFORCEMENT

## Objetivo
Impedir logins simultâneos na mesma conta: quando alguém entra num
dispositivo/navegador novo, qualquer sessão antiga daquela conta é
automaticamente encerrada.

## Decisão de comportamento (mudou durante a conversa)
Paulo pediu inicialmente bloquear o login novo até logout manual do
antigo — alertei sobre o risco real disso (conta travada permanentemente
se alguém fechar o navegador sem clicar em "Sair", gerando pedidos de
suporte). Paulo decidiu então pelo comportamento mais simples e seguro:
**login novo sempre derruba o antigo automaticamente**.

## Solução técnica — mecanismo nativo do Supabase
Em vez de construir uma tabela de controle própria (cheguei a começar
essa abordagem, mas descartei), usei um recurso já pronto do Supabase:
`auth.signOut({ scope: 'others' })` — desconecta todas as **outras**
sessões daquela conta, mantendo só a que acabou de logar. Sem tabela
nova, sem lógica extra de expiração para se preocupar.

## Onde foi aplicado
- **Login por senha** (`app/login/page.tsx`): logo após
  `signInWithPassword` ter sucesso, antes de redirecionar ao dashboard.
- **Login por reconhecimento facial** (`app/api/auth/face-login/route.ts`):
  logo após a sessão ser criada via `verifyOtp` (PATCH_100).

## Arquivos alterados
- `app/login/page.tsx`
- `app/api/auth/face-login/route.ts`

## O que NÃO foi alterado
- Nenhuma tabela nova, nenhuma migração — o mecanismo é 100% do próprio
  Supabase, sem estado extra para gerenciar.
- Login em si (senha, reconhecimento facial) — inalterados, só ganharam
  essa chamada extra logo depois de ter sucesso.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test          # 19 testes, todos passando
npm run build          # build completo
```

## ⚠️ Limitação honesta
Não consigo testar 2 sessões reais simultâneas neste ambiente (sem
navegador). O comportamento segue exatamente a documentação oficial do
Supabase (`scope: 'others'`), mas só o teste ao vivo confirma.

Efeito colateral esperado (e desejado, dado o comportamento escolhido):
se você mesmo estiver logado no celular e no computador ao mesmo tempo
hoje, e entrar de novo em qualquer um dos dois, o outro será
desconectado — é assim que "sem login simultâneo" deveria funcionar.

## Teste funcional recomendado
1. Subir os 2 arquivos.
2. Entrar na conta em duas abas/navegadores diferentes (ex: uma aba
   normal, outra anônima).
3. Fazer login de novo na segunda aba.
4. Voltar pra primeira aba e tentar navegar — deve estar deslogada
   (redirecionada pro login, ou erro de sessão inválida).

## Status
Implementado e validado por build/testes. Comportamento não testado com
sessões reais simultâneas neste ambiente — depende de teste ao vivo.
