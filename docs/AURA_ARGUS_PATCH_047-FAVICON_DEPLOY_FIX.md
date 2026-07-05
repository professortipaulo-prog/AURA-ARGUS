# AURA_ARGUS_PATCH_047 - FAVICON_DEPLOY_FIX

## Objetivo
Corrigir a publicação do favicon no deploy da Vercel sem alterar a landing page, o visual do chat ou a estrutura do dashboard.

## Problema corrigido
O favicon não aparecia no navegador após o deploy. O projeto estava sem declaração explícita de ícones no `app/layout.tsx` e sem fallback em `public/`.

## Arquivos alterados
- `app/layout.tsx`
- `app/favicon.ico`
- `public/favicon.ico`
- `public/favicon.svg`
- `docs/AURA_ARGUS_PATCH_047-FAVICON_DEPLOY_FIX.md`

## Alterações realizadas
- Adicionado `app/favicon.ico` para o comportamento automático do Next.js App Router.
- Adicionado `public/favicon.ico` e `public/favicon.svg` como fallback público direto.
- Atualizada a Metadata API em `app/layout.tsx` com `icons.icon` e `icons.shortcut`.

## Impacto esperado
- A Vercel passa a servir `/favicon.ico` e `/favicon.svg` corretamente.
- Navegadores passam a reconhecer o ícone da aba.
- Não há alteração de layout, CSS, landing page, chat ou módulos funcionais.

## Teste funcional direto no site
1. Fazer deploy na Vercel.
2. Abrir `https://aura-argus.vercel.app`.
3. Atualizar a página com Ctrl + F5.
4. Verificar se o favicon aparece na aba do navegador.
5. Caso ainda apareça o ícone antigo, abrir em janela anônima ou aguardar limpeza de cache do navegador.

## Critérios de aceite
- O site carrega normalmente.
- O favicon aparece na aba do navegador.
- O build da Vercel não quebra.
- Nenhuma tela aprovada sofre alteração visual.

## Status
Patch pronto para deploy.
