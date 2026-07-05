# AURA_ARGUS_PATCH_051 - CHAT_PROCESSING_ANIMATION

## Objetivo
Substituir o texto visível de processamento do Chat IA por uma animação leve, preservando o layout aprovado do chat.

## Escopo
- Alteração isolada no estado visual de carregamento do Chat IA.
- Nenhuma alteração na Landing Page.
- Nenhuma alteração na lógica de IA, memória, router ou Supabase.
- Nenhuma alteração no layout geral do chat.

## Arquivos alterados
- `app/dashboard/chat/page.tsx`
- `app/globals.css`

## Alterações realizadas
- O texto visível `processando` foi preservado apenas para acessibilidade com `sr-only`.
- A frase visível de carregamento foi substituída por uma animação de onda/digitação.
- A animação usa classes específicas do patch:
  - `chat-processing`
  - `chat-processing-wave`
  - `chat-processing-dots`
- Incluído suporte a `prefers-reduced-motion`.

## Teste direto no site
1. Entrar no site.
2. Abrir **Chat IA**.
3. Enviar uma mensagem para AURA ou ARGUS.
4. Durante o processamento, verificar se aparece uma animação no card da IA.
5. Confirmar que a resposta final continua aparecendo normalmente.
6. Confirmar que o visual geral do chat não mudou.

## Critérios de aceite
- O card de processamento não mostra mais o texto grande de carregamento.
- A animação aparece sem deslocar ou quebrar o layout.
- A resposta final substitui normalmente o estado de carregamento.
- O build permanece estável.

## Status
Patch isolado e validado.
