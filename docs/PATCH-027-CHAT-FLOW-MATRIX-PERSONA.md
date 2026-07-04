# PATCH 027 — Chat Flow, Matrix e Persona

Correções:

- Seletor AURA/ARGUS permanece sempre visível no topo do chat.
- Área de conversa passa a rolar internamente, sem cobrir seletor ou campo de digitação.
- Campo de mensagem fica fixo na base do painel de chat.
- Enter envia e Shift+Enter quebra linha.
- Mensagem do usuário e resposta mais recente ganham destaque visual.
- Matrix fica mais sutil, menor e mais rápida.
- Remove peso visual das grades do fundo.
- Corrige envio de `persona` e `systemPrompt` para a API, evitando ARGUS responder como AURA.
- Mantém AURA e ARGUS com personalidades separadas.

Validação:

- `npm run build` executado com sucesso.
