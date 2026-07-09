# AURA_ARGUS_PATCH_095 — CHAT_MESSAGE_META_SIMPLIFICATION

## Objetivo
Remover, a pedido de Paulo, os detalhes técnicos exibidos embaixo de
cada resposta da IA no chat: nome do provedor (`anthropic`/`gemini`),
nome do modelo (`claude-sonnet-5`) e o nome genérico do projeto padrão
("AURA/ARGUS AI Operating System", que só repete o nome do produto sem
agregar informação).

## Antes / depois
Antes: `AURA · anthropic · claude-sonnet-5 · AURA/ARGUS AI Operating System`
Depois: `AURA` (ou `AURA · Nome do Projeto Real`, se o usuário estiver
usando um projeto criado por ele, não o padrão genérico)

## O que foi feito
- Removida a exibição de `provider`/`model` do rodapé de cada mensagem.
- O nome do projeto só aparece no rodapé quando for um projeto real
  criado pelo usuário — o projeto padrão automático
  ("AURA/ARGUS AI Operating System") deixou de ser exibido, por não
  agregar informação nenhuma ao usuário.
- Mesma limpeza aplicada também no caminho de memória local (quando a
  resposta vem da memória do navegador em vez do servidor).

## Arquivo alterado
- `app/dashboard/chat/page.tsx` (2 pontos: resposta real da IA e resposta
  de memória local)

## O que NÃO foi alterado
- Os dados de provedor/modelo continuam sendo salvos e retornados pela
  API (`/api/ai/chat`) — só pararam de aparecer na tela para o usuário.
  Se um dia for útil pra depuração, ainda dá para adicionar de volta só
  em modo de administrador, por exemplo.
- CSS, layout, outras páginas.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Abrir o Chat IA e enviar uma mensagem.
2. Confirmar que o rodapé da resposta mostra só o nome da persona (ex:
   "AURA"), sem menção a "anthropic", "claude-sonnet-5" nem
   "AURA/ARGUS AI Operating System".

## Status
Implementado e validado nesta sessão, a pedido direto de Paulo.
