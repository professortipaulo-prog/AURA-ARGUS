# AURA_ARGUS_PATCH_094 — CHAT_AVATAR_LIVING_ANIMATION

## Objetivo
Dar mais vida aos avatares do Chat IA, reaproveitando um sistema de
animação (olhos piscando, boca mexendo, estado "pensando") que já
existia no código — só que só era usado numa página estática, sempre
travado em "idle", nunca realmente animado.

## Descoberta antes de implementar
O projeto já tinha `components/avatar-panel.tsx`, com suporte a 4
estados (`idle`, `listening`, `thinking`, `speaking`) e CSS completo para
olhos, boca e linha de onda — mas esse componente só é usado na Central
de Operações (`/dashboard`), com o estado sempre fixo em `"idle"`
(hardcoded, nunca muda).

Já o card de avatar do Chat IA (`AvatarDockCard`, criado no PATCH_075)
tinha sua própria animação separada (anéis de voz, ponto de escuta), mas
**não tinha estado de "pensando"** — o intervalo entre enviar a mensagem
e a resposta chegar não tinha nenhuma animação própria.

## O que foi feito
Em vez de duplicar ou escolher um dos dois sistemas, uni o que fazia
sentido de cada um, diretamente no `AvatarDockCard` do Chat (que é o
único lugar com interação real o suficiente para justificar a animação
completa):

1. **Novo estado "pensando"**, ligado ao `isSending` (já existente) — o
   avatar da persona ativa pulsa suavemente (reaproveitando o keyframe
   `avatarThinking`, que já existia mas nunca era usado) e ganha 3
   pontinhos saltitantes, enquanto espera a resposta da IA.
2. **Olhos e boca reais**, sempre presentes (não só durante fala) —
   olhos piscam de vez em quando (reaproveitando o keyframe `blink`,
   também já existente e nunca usado no chat); a boca só aparece/mexe
   durante a fala (`voice-speaking`), reaproveitando o mesmo princípio do
   `mouthTalk` original, adaptado para o tamanho menor do card do chat.
3. Prioridade de estados: **falando > pensando > ouvindo > parado** — só
   um estado aparece por vez, sem conflito visual.

## Arquivos alterados
- `app/dashboard/chat/page.tsx` (`AvatarDockCard`: novo estado
  `'thinking'`, novos elementos de olho/boca/pontinhos; os 2 pontos onde
  o componente é usado, adicionando a lógica de `isSending`)
- `app/globals.css` (novas regras `chat-avatar-eye`,
  `chat-avatar-mouth`, `chat-avatar-thinking-dots`, reaproveitando os
  keyframes `blink` e `avatarThinking` que já existiam no arquivo desde
  antes desta sessão)

## O que NÃO foi alterado
- `components/avatar-panel.tsx` e seu uso na Central de Operações —
  continuam como estavam (esse lugar é um card de status parado, não uma
  conversa ativa; não fazia sentido animar "pensando"/"ouvindo" lá).
- Nenhuma outra página, nenhum outro componente.
- Nenhum keyframe CSS existente foi alterado — só reaproveitado.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat (8.89 kB → 8.95 kB)
```

## Teste funcional recomendado
1. Abrir o Chat IA.
2. Mandar uma mensagem e observar o avatar da persona ativa **enquanto
   espera a resposta** — deve pulsar suavemente com 3 pontinhos
   saltitantes embaixo (estado "Pensando" no rótulo).
3. Observar os avatares parados por alguns segundos — os olhos devem
   piscar de vez em quando, mesmo sem estar falando.
4. Clicar em 🔊 numa resposta e observar a boca do avatar mexendo
   enquanto fala.

## Status
Implementado e validado por build. Teste visual final recomendado no
navegador.
