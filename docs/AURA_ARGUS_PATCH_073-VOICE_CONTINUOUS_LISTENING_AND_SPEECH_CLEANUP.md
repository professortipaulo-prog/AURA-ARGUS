# AURA_ARGUS_PATCH_073 — VOICE_CONTINUOUS_LISTENING_AND_SPEECH_CLEANUP

## Objetivo
Corrigir mais 2 bugs reportados por Paulo após o teste do PATCH_072:

1. A leitura em voz alta "falava" o nome de emojis (ex: 😊 virava "cara
   sorrindo").
2. O microfone fechava sozinho depois de alguns segundos, em vez de ficar
   escutando continuamente até o usuário decidir parar.

## Causa raiz
1. `speakMessage` passava o texto da mensagem direto para
   `SpeechSynthesisUtterance`, sem remover emojis. Alguns motores de fala
   do navegador tentam "descrever" caracteres Unicode pictográficos em vez
   de simplesmente ignorá-los.
2. `recognition.continuous` nunca era definido (assume `false` por padrão
   na maioria dos navegadores) — o reconhecimento parava assim que
   detectava uma pausa curta de silêncio, mesmo com o usuário querendo
   continuar falando.

## Correção aplicada
1. Nova função `sanitizeForSpeech()`: remove emojis/símbolos pictográficos
   (faixas Unicode `\u{1F000}-\u{1FFFF}`, `\u{2600}-\u{27BF}` etc.) e
   marcação markdown comum (`**`, `_`, `` ` ``) antes de enviar o texto para
   `SpeechSynthesisUtterance`. Testado isoladamente com e sem emoji — não
   remove nada além do pretendido.
2. `recognition.continuous = true`, mais uma flag de controle
   (`shouldKeepListeningRef`) que distingue "o navegador parou sozinho por
   timeout de silêncio" (reinicia automaticamente) de "o usuário clicou
   para parar" (encerra de verdade). Erros do tipo `no-speech` (pausa
   natural de silêncio) não encerram mais a escuta; apenas erros reais
   (ex: permissão negada) encerram.

## Arquivos alterados
- `app/dashboard/chat/page.tsx` (único arquivo)

## O que NÃO foi alterado
- CSS, layout, outras páginas.
- PATCH_071/072 (diferenciação de voz por persona, parar áudio ao trocar
  de persona) — continuam intactos, só a limpeza de texto e a escuta
  contínua foram adicionadas.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```
`sanitizeForSpeech` testada isoladamente em Node com texto real (com e sem
emoji/markdown).

## Limitação conhecida (registrada)
Reiniciar o reconhecimento automaticamente após o navegador encerrar por
timeout pode, em alguns navegadores/hardwares, gerar um pequeno "clique" ou
meio segundo de pausa perceptível entre o fim e o reinício — é uma
limitação da própria Web Speech API, não há como eliminar 100% sem trocar
para um serviço de reconhecimento em streaming de terceiros (isso sim
seria uma mudança de arquitetura maior, fora do escopo deste patch).

## Teste funcional recomendado
1. Clique no microfone e fale uma frase, faça uma pausa de 3-4 segundos no
   meio, e continue falando — o microfone deve continuar escutando (ícone
   permanece em ⏺) em vez de fechar sozinho.
2. Clique de novo no microfone para parar manualmente — deve parar de
   verdade.
3. Peça pra AURA responder algo que provavelmente venha com emoji, clique
   em 🔊, e confirme que ela não fala mais o nome do emoji em voz alta.

## Status
Implementado e validado nesta sessão, em resposta direta ao feedback do
teste dos patches anteriores de voz.
