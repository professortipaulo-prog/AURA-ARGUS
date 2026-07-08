# AURA_ARGUS_PATCH_072 — VOICE_PERSONA_SEPARATION

## Objetivo
Corrigir 2 bugs reais reportados por Paulo após testar o PATCH_071:

1. **Áudio não parava ao trocar de persona** — clicar em AURA→ARGUS (ou
   vice-versa) durante uma fala em andamento deixava o áudio da persona
   anterior tocando por cima da nova, como se fosse a mesma conversa.
2. **AURA e ARGUS soavam com a mesma voz** (ambas masculinas no ambiente
   testado) — sem nenhuma diferenciação entre as duas personas.

## Causa raiz
1. `switchPersona()` só trocava o estado da persona e limpava o campo de
   texto — nunca chamava `speechSynthesis.cancel()` nem parava o
   reconhecimento de voz em andamento.
2. `speakMessage()` criava a `SpeechSynthesisUtterance` só com
   `lang = 'pt-BR'`, sem nunca escolher uma voz nem ajustar tom/velocidade
   — o navegador sempre usava a mesma voz padrão do sistema para as duas
   personas.

## Correção aplicada
1. `switchPersona()` agora chama `window.speechSynthesis.cancel()`, zera
   `speakingIndex`, e para o reconhecimento de voz se estiver ativo, antes
   de trocar de persona.
2. Nova função `pickVoiceForPersona()`: tenta encontrar, entre as vozes
   `pt-*` disponíveis no navegador, uma com nome que sugira voz feminina
   (para AURA) ou masculina (para ARGUS), por palavras-chave no nome da
   voz.
3. **Reforço que funciona mesmo sem vozes variadas disponíveis** (o caso
   mais comum — muitos sistemas só têm 1 voz pt-BR instalada): `pitch` e
   `rate` da fala agora são sempre diferentes por persona (AURA: tom mais
   agudo e levemente mais rápido; ARGUS: tom mais grave e levemente mais
   lento) — então mesmo sem voz "feminina"/"masculina" real disponível no
   sistema, as duas personas nunca soam idênticas.
4. `speakMessage()` agora recebe a persona da própria mensagem
   (`msgPersona`, já existente no loop de renderização), não a persona
   ativa no momento do clique — corrige também o caso de tocar uma
   mensagem antiga de uma persona enquanto a outra está selecionada.

## Arquivos alterados
- `app/dashboard/chat/page.tsx` (único arquivo)

## O que NÃO foi alterado
- CSS, layout, outras páginas, Action Engine, Memory Engine.
- Nenhuma dependência nova — tudo via `SpeechSynthesisVoice`/
  `SpeechSynthesisUtterance`, nativos do navegador.

## Limitação conhecida (registrada, não escondida)
A escolha de voz por nome é heurística — depende de quais vozes o sistema
operacional/navegador do usuário tem instaladas, e nem todo ambiente expõe
vozes com indicação de gênero no nome. Por isso o ajuste de `pitch`/`rate`
é o mecanismo garantido de diferenciação; a seleção de voz por nome é um
bônus quando disponível.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat compilado (7.82 kB → 8.13 kB)
```

## Teste funcional recomendado
1. No Chrome, mande uma mensagem para AURA, clique em 🔊 na resposta e
   comece a ouvir.
2. **Enquanto ainda está falando**, clique no card do ARGUS.
3. Esperado: o áudio da AURA para imediatamente ao trocar de persona.
4. Mande uma mensagem para ARGUS, clique em 🔊 na resposta.
5. Esperado: o tom da voz do ARGUS é perceptivelmente mais grave/lento que
   o da AURA (mesmo que a voz "de base" do navegador seja a mesma).

## Status
Implementado e validado nesta sessão, em resposta direta ao feedback do
teste do PATCH_071.
