# AURA_ARGUS_PATCH_069 — ACTION_ENGINE_LINK_PREPARE

## Objetivo
Expandir o Action Engine com uma nova capacidade real (`link.prepare`), que
não depende de credenciais externas (OAuth) — cobrindo os itens do catálogo
original do Executor de Ações: "abrir URL" (sem confirmação) e "preparar
mensagem de WhatsApp Web" (com confirmação, sem envio automático).

## Por que não implementei Google Drive / Gmail / NotebookLM
Os 3 itens `planned` restantes (`google.drive.upload`, `gmail.send`,
`notebooklm.link`) exigem OAuth real com o Google: criação de projeto no
Google Cloud Console, tela de consentimento, Client ID/Secret, redirect URI
registrado no domínio de produção (Vercel). São decisões de infraestrutura
que só Paulo pode tomar — implementar isso "às cegas" seria inventar uma
solução sem a base necessária, o que a Regra 6 das instruções do projeto
proíbe. Fica registrado aqui como pendência, não como decisão tomada por
conta própria.

## Arquivos alterados
- `lib/actions/types.ts` — novo `ActionKind: 'link.prepare'`, campos de
  request (`linkTarget`, `url`, `phone`, `message`), novo tipo
  `PreparedLink` e campo `link?` em `ExecuteActionResult`.
- `lib/actions/capabilities.ts` — nova capacidade `link.prepare`, status
  `active`.
- `lib/actions/server.ts` — nova branch de execução: monta URL de
  `wa.me` (WhatsApp) ou valida e retorna uma URL genérica; persiste o
  run em `core.action_runs` (mesma tabela já usada por `document.create`,
  coluna `action` é `text` livre, sem enum — não precisou de migração).
- `app/dashboard/actions/page.tsx` — novo cartão "LINK ENGINE" na página já
  existente, reaproveitando 100% das classes CSS já existentes
  (`aios-panel`, `aios-format-card`, `aios-form-control`, `aios-input`,
  `aios-primary-button`, `aios-action-result`, `aios-artifact-card`) —
  nenhuma classe CSS nova foi criada, nenhum estilo existente foi alterado.

## O que este patch NÃO altera
- CSS global, layout do dashboard, sidebar, header, animações.
- O composer de documentos existente (`document.create`) — continua
  idêntico, só ganhou um card irmão ao lado.
- Nenhuma integração OAuth real (Drive/Gmail/NotebookLM continuam `planned`).

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/actions compilado com o novo card
```
Testado isoladamente em Node (4 cenários): URL válida, URL inválida (erro
tratado), WhatsApp com número+mensagem, WhatsApp sem número (erro tratado).

## Teste funcional recomendado no site
1. Abrir `Central de Ações` → novo card "LINK ENGINE".
2. Aba "Abrir URL": colar `https://github.com/seu-usuario` → Preparar link
   → confirmar que aparece "Abertura direta" e o botão "Abrir agora" leva
   ao GitHub.
3. Aba "WhatsApp Web": preencher número (com DDI+DDD) e mensagem → Preparar
   link → confirmar que aparece "Confirmação necessária" e o link abre o
   WhatsApp Web com o texto já preenchido (nada é enviado sozinho).
4. Testar os campos vazios/URL inválida e confirmar que o erro aparece de
   forma clara, sem quebrar a página.

## Status
Implementado e validado nesta sessão. Pendência registrada (não resolvida
por decisão própria): integrações reais com Google (Drive/Gmail) e
NotebookLM dependem de configuração OAuth que só Paulo pode fazer no Google
Cloud Console.
