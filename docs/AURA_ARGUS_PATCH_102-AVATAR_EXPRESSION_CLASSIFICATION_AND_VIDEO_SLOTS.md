# AURA_ARGUS_PATCH_102 — AVATAR_EXPRESSION_CLASSIFICATION_AND_VIDEO_SLOTS

## Objetivo
Preparar a infraestrutura para os avatares animados em vídeo, pedidos
por Paulo — construir agora a parte que não depende dos arquivos de
vídeo (classificação de tom + estrutura do componente), deixando pronto
para receber os 8 vídeos (4 estados × 2 personas) assim que ficarem
disponíveis.

## Contexto
Paulo enviou um vídeo de exemplo gerado por IA (10s, com áudio
embutido). Análise: o vídeo tem fala fixa gravada, incompatível com
respostas dinâmicas da IA (que já usam nosso próprio motor de voz,
PATCH_071-075). Combinado com Paulo: pedir 4 vídeos **mudos**, em loop,
por persona (talking, smiling, serious, idle) — 8 no total — e integrar
a troca de vídeo por estado.

## O que foi implementado agora (não depende dos vídeos)

### Classificação de tom da resposta
`lib/avatar/expression.ts`: `classifyExpression(text)` — analisa o texto
da resposta da IA e decide qual expressão mostrar:
- **serious**: resposta contém incerteza/falta de informação ("não sei",
  "preciso de mais informações", "não encontrei", etc.)
- **smiling**: resposta indica conclusão/sucesso ("perfeito", "concluído",
  "com certeza", "excelente", etc.)
- **talking**: padrão neutro, para qualquer outra resposta.

Testado isoladamente com 5 frases reais antes de integrar — classificou
corretamente todos os casos.

### Estrutura do componente, pronta para vídeo
`AvatarDockCard` (Chat IA) agora:
- Tem um estado por expressão (`talking`/`smiling`/`serious`), no lugar
  do genérico `speaking` de antes.
- Cada persona tem um campo `videos: { talking, smiling, serious, idle }`
  no código — hoje todos `undefined`.
- **Enquanto os vídeos não existirem, nada muda visualmente** — o
  componente continua usando a foto + animação CSS (olhos piscando, boca
  mexendo) exatamente como antes, testado e funcionando desde o
  PATCH_094.
- Assim que um vídeo for adicionado (ex: `videos.talking = '/avatars/aura-talking.mp4'`),
  o componente troca automaticamente para mostrar o vídeo em loop naquele
  estado, sem precisar mexer em mais nada.

## Especificação dos vídeos (repetindo o combinado em conversa)
8 arquivos: `aura-talking.mp4`, `aura-smiling.mp4`, `aura-serious.mp4`,
`aura-idle.mp4`, `argus-talking.mp4`, `argus-smiling.mp4`,
`argus-serious.mp4`, `argus-idle.mp4` — mudos, 2-4s em loop perfeito,
mesmo enquadramento das fotos atuais, idealmente sem o anel/círculo de
fundo (o CSS já desenha esse efeito).

## Arquivos novos
- `lib/avatar/expression.ts`

## Arquivos alterados
- `app/dashboard/chat/page.tsx` (`AvatarDockCard` aceita vídeo opcional;
  `PERSONAS` ganhou campo `videos`; os 2 pontos de cálculo de estado
  usam `classifyExpression` em vez do `speaking` fixo)
- `app/globals.css` (seletores atualizados de `voice-speaking` para os 3
  estados de expressão; nova classe `.chat-avatar-video`)

## O que NÃO foi alterado
- Nenhum comportamento visual muda até os vídeos existirem — validado
  que o caminho sem vídeo (`videoSrc` undefined) segue exatamente a
  mesma lógica de antes.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat (9.79 kB → 10.3 kB)
```
`classifyExpression` testada isoladamente com 5 frases reais de resposta
de IA — classificou corretamente antes de integrar ao componente.

## Próximo passo (aguardando os vídeos)
Quando Paulo tiver os 8 arquivos, é só enviar — preencho os campos
`videos` de cada persona com os caminhos reais (`public/avatars/...`) e
o sistema passa a usar vídeo automaticamente, sem precisar de mais
nenhuma mudança de lógica.

## Status
Infraestrutura pronta e validada. Aguardando os arquivos de vídeo de
Paulo para a integração final.
