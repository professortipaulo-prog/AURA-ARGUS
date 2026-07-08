# AURA_ARGUS_PATCH_071 — VOICE_WEB_SPEECH_API

## Objetivo
Implementar a primeira fatia real de Voz (item CLAUDE-06 do roadmap
original), usando a Web Speech API nativa do navegador — sem OAuth, sem
chave de API, sem custo. Escolhido como próxima prioridade por não
depender de nenhuma decisão ou credencial externa de Paulo (diferente de
Google Drive/Gmail, que dependem de OAuth, ou da decisão de escopo
cliente/admin, ainda em aberto).

## O que foi implementado
No Chat IA (`app/dashboard/chat/page.tsx`):
- **Botão de microfone (🎙)** no composer: usa `SpeechRecognition` /
  `webkitSpeechRecognition` para transcrever fala em português (pt-BR) e
  inserir o texto no campo de mensagem. Ícone muda para ⏺ enquanto ouve.
- **Botão de ouvir (🔊)** em cada resposta do assistente: usa
  `SpeechSynthesis` para ler o texto em voz alta em português. Ícone muda
  para ⏹ enquanto fala, permitindo interromper.
- **Detecção de suporte do navegador em tempo de execução:** se o
  navegador não suportar a Web Speech API (ex: Firefox, Safari têm suporte
  parcial/nenhum para reconhecimento), os dois botões simplesmente não
  aparecem — nenhum erro, nenhuma quebra de layout.

## Ajuste de CSS necessário (e por quê)
O grid do composer (`app/globals.css`, `.chat-composer-dock`) era fixo para
exatamente 2 colunas: textarea + 1 botão (`86px`/`74px`/`68px` nos 3
breakpoints responsivos existentes). Adicionar um segundo botão sem ajustar
isso quebraria o layout (botões sobrepostos ou grid transbordando).

Ajuste feito: a segunda coluna do grid virou `auto` (em vez de largura
fixa) nos 3 breakpoints, e os dois botões (microfone + enviar) foram
agrupados num wrapper `.chat-composer-actions` (flex, `gap: 8px`) que ocupa
essa coluna. Como o botão perdeu a largura que antes vinha "de graça" do
grid fixo, adicionei `width` explícita em `.chat-composer-dock button` nos
3 breakpoints (64px/54px/46px), preservando a proporção visual original.

Nenhuma classe ou regra existente foi removida — só a largura da coluna e
do botão foi trocada de fixa para adaptativa, e 3 classes novas foram
criadas (`.chat-composer-actions`, `.chat-mic-button.is-listening` com uma
animação de pulso, `.chat-speak-button`).

## Arquivos alterados
- `app/dashboard/chat/page.tsx` — estados, funções `toggleListening` e
  `speakMessage`, botões de microfone e de ouvir.
- `app/globals.css` — grid do composer ajustado (3 breakpoints) + 3 regras
  novas.
- `modules/voice/index.ts` e `modules/voice/README.md` — status atualizado
  de `not_implemented` para `partial`, documentando onde a lógica real vive
  hoje (embutida no chat, não extraída para o módulo ainda).

## O que NÃO foi alterado
- Nenhum outro componente, página ou classe CSS fora do composer do chat.
- Nenhuma dependência nova instalada — Web Speech API é nativa do browser.
- Câmera, reconhecimento facial, "palavra de ativação" (escuta contínua)
  continuam como placeholder — fora do escopo deste patch.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat compilado (7.36 kB → 7.82 kB)
```

## Limitação conhecida, registrada (não escondida)
Reconhecimento de fala via `SpeechRecognition` tem suporte completo no
Chrome/Edge; Firefox e Safari têm suporte parcial ou ausente. Nesses
navegadores, os botões de voz simplesmente não aparecem (detecção via
feature-check), então a experiência degrada de forma segura, mas o recurso
não vai funcionar para 100% dos usuários dependendo do navegador deles.

## Teste funcional recomendado no site
1. Abrir o Chat IA no **Chrome** (navegador com melhor suporte).
2. Clicar no botão 🎙, permitir acesso ao microfone quando solicitado pelo
   navegador, falar uma frase curta e confirmar que o texto aparece no
   campo de mensagem.
3. Enviar a mensagem, aguardar a resposta, clicar no botão 🔊 na resposta e
   confirmar que a IA "fala" a resposta em português.
4. Testar no Firefox/Safari e confirmar que os botões de voz não aparecem
   (comportamento esperado), sem nenhum erro visível na tela.

## Status
Implementado e validado nesta sessão. Primeira fatia real de Voz do
roadmap original (CLAUDE-06).
