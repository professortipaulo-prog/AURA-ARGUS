# AURA_ARGUS_PATCH_092 — TEMPORAL_LOCATION_PRIORITY_FIX

## Objetivo
Corrigir bug reportado por Paulo: estando fisicamente em Brasília-DF, e
avisando isso explicitamente na mensagem ("nesse momento estou em
brasília df"), a AURA respondeu com horário e clima de **Salvador-BA**,
ignorando completamente o que ele acabou de dizer.

## Causa raiz
O sistema tem um timezone padrão fixo (`America/Bahia`, configurável via
`AURA_ARGUS_TIMEZONE`) — mas esse valor é só uma **referência de relógio**
para o servidor não perder a noção de data/hora real (evitar a IA
"esquecer" que data é hoje). Ele nunca foi pensado como "onde o usuário
está fisicamente".

O texto do bloco temporal, porém, dizia "Use estes dados como verdade" de
forma genérica demais — a IA interpretou isso como permissão para tratar
"timezone = America/Bahia" como sinônimo de "o usuário está na
Bahia/Salvador", e usou isso pra buscar clima de Salvador, **mesmo depois
do usuário dizer, na mesma mensagem, que estava em Brasília**.

Não existe hoje nenhum mecanismo de geolocalização real (GPS do
navegador) no sistema — o "padrão Salvador" nunca foi uma localização de
verdade, sempre foi só o fuso-horário de referência do servidor.

## Correção aplicada
Reescrita a instrução do bloco temporal (`temporalPromptBlock`, usada em
toda conversa real, não só no debug — já unificada desde o PATCH_075):

- Deixa claro que o timezone é **"referência de relógio do servidor"**,
  não a localização do usuário.
- Instrui explicitamente: **nunca assumir cidade, clima ou horário local
  do usuário a partir desse timezone**.
- Instrui que, se o usuário informar a localização atual na própria
  mensagem, essa informação **tem prioridade** sobre qualquer suposição.

## Arquivo alterado
- `lib/memory/server.ts` (função `temporalPromptBlock`, única alteração)

## O que NÃO foi alterado
- O timezone de referência do servidor continua sendo usado para
  calcular a data/hora "de verdade" (isso está correto e não é o
  problema) — só a forma como a IA pode *interpretar* esse dado mudou.
- Nenhuma outra função, nenhuma outra página.

## ⚠️ Limitação honesta — isso é ajuste de prompt, não de código
determinístico
Diferente da maioria dos patches anteriores, esta correção **não é
100% garantida por natureza** — é uma instrução mais clara para o
modelo de IA seguir, não uma regra de código que sempre executa igual.
Modelos de linguagem geralmente seguem instruções bem escritas de forma
consistente, mas não há como eu "testar" isso com certeza absoluta como
testo uma função — só o teste real da sua parte confirma se o
comportamento realmente mudou.

## Sobre geolocalização automática de verdade (não implementado agora)
Se você quiser que o sistema saiba automaticamente onde você está (sem
precisar digitar toda vez), isso é possível com a API de Geolocalização
do navegador (pede permissão, pega latitude/longitude, manda junto com
cada mensagem) — mas é uma peça nova, maior, que não constrói sozinha.
Não implementei agora porque não foi pedido explicitamente; registrado
como opção para quando você quiser.

## Teste funcional recomendado
1. Subir `lib/memory/server.ts`.
2. Aguardar o deploy terminar.
3. Repetir a mesma pergunta: "nesse momento estou em Brasília DF: qual o
   horário e clima aqui agora?"
4. Confirmar que a resposta agora fala de Brasília, não de Salvador.
5. Perguntar sem informar localização nenhuma (ex: só "que horas são?")
   e confirmar que a resposta não inventa uma cidade específica — deve
   focar só no horário do servidor, sem alegar saber onde você está.

## Status
Corrigido via ajuste de instrução de prompt, com causa raiz bem
identificada. Por ser comportamento de IA (não código determinístico),
depende de teste real para confirmação — sem garantia absoluta como nos
patches de lógica pura.
