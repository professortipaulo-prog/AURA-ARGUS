# AURA_ARGUS_PATCH_132 — ADMIN_PREVIEW_MODE

## Objetivo
No cartão de perfil da barra lateral (onde hoje mostra "Perfil: owner"),
adicionar um seletor para o dono/admin "testar como" Estudantil ou
Worker — sem precisar de conta separada, sem alterar nenhum dado real
da conta.

## Como funciona
1. Um seletor com 3 botões aparece na barra lateral, só para quem é
   dono/admin de verdade (e só quando a própria conta não é já uma
   conta restrita): **Eu (owner) / Estudantil / Worker**.
2. Ao clicar, salva a escolha num cookie temporário (`aios_preview_type`,
   expira em 12h) e recarrega a página.
3. Enquanto o cookie estiver ativo, você vê exatamente o que aquele tipo
   de conta veria: menu simplificado, página inicial correspondente
   (Central de Estudos ou Central de Ações).
4. Clicar em "Eu (owner)" remove o modo de visualização e volta ao seu
   painel normal.

## Importante: é só visual, não muda seus dados
O cookie só afeta **o que aparece na tela** — sua conta continua sendo
owner de verdade, com todos os seus dados e permissões reais intactos.
Não é possível usar isso para restringir a própria conta por engano de
forma permanente.

## Arquivos novos
- `lib/admin/preview-mode.ts` (constante compartilhada do cookie)
- `app/api/admin/preview-mode/route.ts`
- `components/layout/preview-mode-toggle.tsx`

## Arquivos alterados
- `app/dashboard/layout.tsx` (lê o cookie, aplica no menu)
- `app/dashboard/page.tsx` (respeita o cookie no redirecionamento)
- `components/layout/sidebar.tsx` (exibe o seletor, mostra "visualizando
  como..." quando ativo)
- `app/globals.css` (estilo do seletor, aditivo)

## Correção durante a validação
Um erro real de build apareceu na primeira tentativa: rotas do Next.js
só podem exportar `GET`/`POST`/etc. e alguns campos de configuração —
não uma constante solta como eu tinha feito inicialmente. Movida para um
módulo próprio (`lib/admin/preview-mode.ts`) e corrigido antes de
entregar.

## O que NÃO foi alterado
- Nenhum dado de conta real — só apresentação.
- Contas Estudantil/Worker reais (não-admin) não veem esse seletor.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando
npm run build           # build completo (após corrigir o erro de
                          exportação de rota) — /api/admin/preview-mode
                          compilou
```

## Teste funcional recomendado
1. Subir todos os arquivos (não precisa de migração nova).
2. Entrar com sua conta normal de dono.
3. No seletor "Testar como", clicar em "Estudantil" — confirmar que cai
   na Central de Estudos com o menu simplificado.
4. Clicar em "Worker" — confirmar que cai na Central de Ações com o
   menu de worker.
5. Clicar em "Eu (owner)" — confirmar que volta ao painel completo
   normal.

## Status
Implementado e validado por build/testes (após corrigir o erro de
exportação de rota detectado durante a própria validação).
