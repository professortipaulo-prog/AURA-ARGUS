# Avatares animados de AURA e ARGUS — níveis e decisão de produto

O Product Owner pediu avatares que "se movimentam ao falar/ouvir, como
uma pessoa real". Isso não é um único recurso — são níveis diferentes
de complexidade, custo e dependências externas. Este documento explica
cada um para decisão consciente antes de implementar além do Nível 2.

## Nível 1 — Placeholder abstrato (já entregue antes)
Círculo com gradiente + ícone/inicial, animado por CSS (respiração,
anéis, pontos, barras). Sem foto real. Zero custo, zero dependência.

## Nível 2 — Foto real + animação por estado (implementado agora)
Usa as fotos reais de AURA e ARGUS que você enviou. A foto em si não
"mexe a boca", mas:
- Pulsa suavemente em repouso (parece respirar).
- Balança e ganha anéis pulsantes ao "ouvir".
- Ganha um overlay de pontos ao "pensar".
- Ganha barras de "voz" sobre a foto ao "falar".

Isso já passa a sensação de "vivo" e reage a interação (testado no chat
com o botão Enviar), mas a boca da foto continua parada — é uma
animação ao redor da foto, não da foto.

**Custo: zero. Dependências: nenhuma (só CSS).**

## Nível 3 — Lip-sync fotorrealista (boca se move de verdade)
Isso é o que really parece "uma pessoa falando". Existem dois caminhos,
nenhum deles é só "escrever mais código" — envolvem decisão de
produto/orçamento:

### 3a. Vídeo pré-gravado com visemas
Gravar (ou gerar por IA) pequenos clipes de vídeo de AURA e ARGUS
falando cada fonema/expressão, e alternar entre eles conforme o texto
da resposta. Complexo de manter, mas roda sem depender de terceiros em
tempo real.

### 3b. Serviço de avatar de IA em tempo real (terceiros)
Serviços como D-ID, HeyGen, Synthesia (ou similares) recebem uma foto
+ um áudio/texto e geram um vídeo com lip-sync realista, muitas vezes
em tempo real via API/streaming. É o caminho mais rápido para um
resultado realista, mas:
- Tem custo por minuto/geração (cobrança à parte da Anthropic/Gemini).
- É mais uma chave de API e mais uma integração de backend a proteger.
- Precisa ser escolhido e contratado por você antes de eu integrar.

## Recomendação
Ficar no **Nível 2** para o MVP (já entregue) e decidir o **Nível 3**
como uma sprint própria, depois que o chat estiver realmente
conectado à IA (Gemini/Anthropic) — faz mais sentido animar a boca
depois que existir uma resposta real de IA para sincronizar.

## Pendência registrada
Aguardando decisão do Product Owner sobre Nível 3: (a) não fazer por
enquanto, (b) vídeo pré-gravado, ou (c) serviço de terceiros (indicar
qual, para orçar).
