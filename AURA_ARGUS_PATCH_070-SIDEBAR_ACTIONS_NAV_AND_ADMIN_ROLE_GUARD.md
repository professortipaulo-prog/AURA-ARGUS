# AURA_ARGUS_PATCH_070 — SIDEBAR_ACTIONS_NAV_AND_ADMIN_ROLE_GUARD

## Objetivo
Dois itens, um pedido diretamente e outro que é o passo seguro e necessário
para o pedido maior de "acesso diferenciado cliente x admin":

1. Adicionar **"Ações"** na barra lateral (pedido direto do usuário).
2. Restringir o acesso ao **Admin** por papel (`role`), tanto no menu quanto
   no servidor — fundação necessária antes de qualquer decisão maior sobre
   separação cliente/admin.

## Contexto da decisão maior (não resolvida nesta sessão)
O usuário pediu "criar acesso a informações à IA de usuários normais
(clientes) e usuário admin", mas não definiu qual dos formatos quer:
(a) a IA responder/ver diferente por papel, (b) um painel admin vendo dados
de todos os clientes, (c) as duas coisas. Confirmado que hoje só o próprio
usuário (owner) usa o sistema — é planejamento para quando houver clientes.

Por não haver decisão de escopo, **nenhuma dessas três opções foi
implementada agora** — ficaria inventando arquitetura sem base. Em vez
disso, implementei a parte que é pré-requisito de segurança para qualquer
uma das três opções: garantir que o próprio conceito de papel (`role`), que
já existia no código (`lib/auth/session.ts`), realmente restrinja algo.

## Achado de segurança (antes desta sessão)
- `Sidebar` recebia a prop `role`, mas só a exibia como texto
  ("Perfil: owner") — nunca a usava para esconder itens do menu.
- `/dashboard/admin` não tinha nenhuma verificação de sessão/papel no
  servidor — qualquer pessoa logada, de qualquer papel, que soubesse a URL,
  acessava a página (hoje só com dados de exemplo, mas sem cadeado real).

## Arquivos alterados
- `components/layout/sidebar.tsx` — item "Ações" adicionado; item "Admin"
  movido para uma lista separada, só incluída no menu se
  `role === 'owner' || role === 'admin'`.
- `app/dashboard/admin/page.tsx` — guard de servidor: chama `getSession()` +
  `isAdmin(session)` (função já existente em `lib/auth/session.ts`) e
  redireciona para `/dashboard` se o usuário não for owner/admin.

## O que NÃO foi alterado
- Nenhuma tabela nova, nenhuma migração nova — reaproveitou `AuraRole` e
  `isAdmin()` já existentes.
- Nenhuma lógica de IA, memória ou identidade — este patch é só
  visibilidade de navegação + guard de página, não isolamento de dados
  entre usuários (isso já é feito por RLS, ver PATCH anteriores).
- CSS/layout — reaproveita 100% das classes já existentes.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/admin e /dashboard/actions ok
```

## Pendência registrada — decisão em aberto para Paulo
Antes de eu implementar qualquer coisa maior de "cliente x admin", preciso
que você decida (não há resposta certa técnica, é decisão de produto):

1. A IA deve ter comportamento/contexto diferente para clientes vs você?
2. Você quer um painel onde vê dados/conversas de todos os clientes?
3. Os dois?

Cada opção tem escopo e risco bem diferentes (a opção 2, por exemplo, exige
decidir exatamente quais dados um admin pode ver de um cliente, o que é
também uma questão de LGPD/privacidade, já mapeada no seu próprio Plano de
Segurança).

## Status
Implementado e validado. Base de segurança pronta; decisão maior sobre
multi-tenant/admin ainda pendente, aguardando definição de escopo.
