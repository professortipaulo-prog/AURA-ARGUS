# AURA_ARGUS_PATCH_077 — REMOVE_AUTOSPEAK_TOGGLE_UI

## Objetivo
Remover o controle visual de "Áudio automático: ligado/desligado" do
rodapé do chat, a pedido de Paulo — mesmo depois do PATCH_076 corrigir o
CSS, o elemento continuava incomodando/atrapalhando a leitura no lugar
onde estava.

## Decisão tomada
Em vez de tentar mais um ajuste de posicionamento/tamanho no mesmo lugar
(terceira tentativa arriscaria o mesmo tipo de regressão visual), optei
por remover o controle visível por completo. O áudio automático **continua
ligado por padrão** (comportamento do PATCH_074 preservado) — só não há
mais um botão visível para desligá-lo no chat.

## Arquivos alterados
- `app/dashboard/chat/page.tsx` — removido o bloco do botão de alternância
  do rodapé do composer; a dica volta a ser só
  "Enter envia • Shift + Enter quebra linha • Persona ativa: [nome]".
- `app/globals.css` — removida a classe `.chat-autospeak-toggle`, que
  ficou sem uso.

## O que NÃO foi alterado
- O comportamento de falar automaticamente continua ativo (estado
  `autoSpeak` continua `true` por padrão, useEffect intacto).
- Microfone, botão de enviar, botão de ouvir por mensagem, animação do
  avatar — nada disso foi tocado.

## Pendência registrada
Se, no futuro, Paulo quiser voltar a ter controle para desligar o áudio
automático, o lugar recomendado é a página de **Configurações**
(`/dashboard/settings`), não o rodapé do chat — evita competir por espaço
com a leitura da conversa. Não implementado agora por não ter sido
pedido; registrado aqui para não perder a ideia.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Status
Implementado e validado nesta sessão, em resposta direta ao pedido de
remoção de Paulo.
