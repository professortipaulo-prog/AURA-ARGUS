# AURA_ARGUS_PATCH_074 — VOICE_AUTOSPEAK_DEFAULT_AND_PERSONA_SWITCH_HARDENING

## Objetivo
1. Reforçar a interrupção de áudio ao trocar de persona — Paulo reportou
   que, mesmo após o PATCH_072, o áudio da AURA continuava tocando ao
   clicar em ARGUS.
2. Tornar a leitura em voz alta **automática por padrão** (a cada resposta
   nova do assistente), em vez de exigir clique manual no botão 🔊 —
   pedido explícito de Paulo. Adicionado um botão para desligar, já que o
   padrão passou a ser ligado.

## Sobre o item 1 — investigação
Revisei o código do PATCH_072: `switchPersona()` já chamava
`window.speechSynthesis.cancel()` corretamente. Não encontrei nenhum
caminho de código que muda a persona sem passar por essa função — o botão
de cada card de persona (`AvatarDockCard`) chama `switchPersona` direto,
sem lógica própria que pudesse interceptar isso.

**Hipótese mais provável:** o PATCH_072 (ou 073) pode não ter sido
aplicado corretamente no deploy em produção — já aconteceu antes nesta
sessão (patch enviado com caminho de pasta errado). Recomendo confirmar
que o conteúdo de `app/dashboard/chat/page.tsx` em produção realmente
inclui as funções `switchPersona`, `toggleListening` e `speakMessage` como
estão neste patch antes de considerar o bug não resolvido.

**Reforço aplicado de qualquer forma (defesa em profundidade):** adicionei
um `useEffect` que roda sempre que o estado `persona` muda — não importa
por qual caminho — e chama `speechSynthesis.cancel()` de novo. Isso cobre
qualquer código futuro que venha a mudar a persona sem passar direto por
`switchPersona()`.

## Sobre o item 2 — áudio automático por padrão
- Novo estado `autoSpeak`, iniciado em `true` (ligado por padrão).
- Novo `useEffect` que observa a lista de mensagens: sempre que a última
  mensagem for do assistente e ainda não tiver sido falada nesta sessão,
  chama `speakMessage` automaticamente (reaproveitando a mesma função do
  botão manual — inclusive a diferenciação de voz/tom por persona dos
  patches anteriores).
- A mensagem de boas-vindas inicial (índice 0, já presente ao abrir a
  tela) **não** é falada automaticamente — só respostas geradas a partir
  de uma pergunta real, para não surpreender o usuário assim que abre o
  chat.
- Novo botão, ao lado da dica "Enter envia...", para ligar/desligar o
  áudio automático quando quiser silêncio.

## Arquivos alterados
- `app/dashboard/chat/page.tsx` (único arquivo)

## O que NÃO foi alterado
- CSS/layout de outras páginas.
- A lógica de diferenciação de voz (pitch/rate) e limpeza de emoji dos
  patches 072/073 — reaproveitadas sem alteração.

## Validação executada
```
npm run typecheck   # 0 erros (1 erro de tipo corrigido: acesso a array
                       possivelmente undefined, guard adicionado)
npm run build         # build completo, /dashboard/chat (8.13 kB → 8.46 kB)
```

## Teste funcional recomendado
1. Mande uma mensagem para AURA e **não clique em nada** — a resposta deve
   começar a ser falada sozinha.
2. **Enquanto ela ainda fala**, clique no card do ARGUS — o áudio deve
   parar imediatamente (se ainda não parar, é sinal de que os patches
   anteriores não foram aplicados em produção — verifique o conteúdo do
   arquivo publicado).
3. Clique no botão "Áudio automático: 🔊 ligado" para desligar, mande outra
   mensagem, e confirme que agora ela NÃO fala sozinha (só ao clicar
   manualmente no 🔊 de cada resposta).

## Status
Implementado e validado nesta sessão. Item 1 tem reforço de segurança
aplicado, mas a causa mais provável do bug persistente é um deploy
incompleto dos patches anteriores — pedir confirmação a Paulo antes de
investigar mais fundo.
