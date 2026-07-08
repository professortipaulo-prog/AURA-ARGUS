# AURA_ARGUS_PATCH_081 — LANDING_CINEMATIC_HERO_REDESIGN

## Objetivo
Aplicar a direção visual "Opção A" (cinematográfico/sci-fi) que Paulo
escolheu, entre 3 protótipos apresentados em conversa, à landing page real
(`app/page.tsx`), substituindo o tratamento anterior do título e dos
avatares — sem recriar a página do zero.

## Contexto
A landing já tinha uma base sofisticada (chuva de binário, glows
animados, respiração nos avatares) — em vez de descartar isso, o patch
**evolui** o que já existia para bater com a direção escolhida, trocando
só os elementos que definiam o "clichê" (degradê de 3 cores no texto,
avatares em card circular com anel decorativo vazio) pelo tratamento
cinematográfico (tipografia técnica, avatares em corte diagonal
fotográfico).

## O que mudou

### Tipografia
- Fonte **Chakra Petch** adicionada via Google Fonts (`app/layout.tsx`,
  só um `<link>` no head — sem `next/font`, sem restruturação).
- Título principal: trocado de gradiente roxo→azul→rosa (o clichê mais
  comum em landing de IA hoje) para **contorno vazado em ciano**
  (`-webkit-text-stroke`), mais alinhado à estética técnica.
- Eyebrow ("Núcleo de Inteligência Operacional"): mesma fonte técnica,
  espaçamento entre letras maior.

### Avatares
- Trocado o card circular com "anel de órbita" decorativo (que ficava
  vazio, sem texto) por um **corte diagonal fotográfico**, ocupando o
  card inteiro, com legenda "AURA"/"ARGUS" no canto superior — a marca
  registrada da direção escolhida.
- A animação de respiração (`psfBreathe`), que já existia, foi mantida —
  só o formato do recorte da foto mudou.

## Arquivos alterados
- `app/layout.tsx` (import da fonte)
- `app/page.tsx` (texto dentro do label do avatar, antes vazio)
- `app/globals.css` (tipografia do herói + tratamento dos avatares)

## O que NÃO foi alterado
- A chuva de binário (`psfhome-rain`), os glows (`psfhome-glow-a/b`), o
  grid de fundo — já existiam e já batem com a direção cinematográfica,
  não precisaram de ajuste.
- Cards de capacidades, seção de significado (AURA/ARGUS), módulos,
  rodapé — todo o conteúdo informativo abaixo do herói continua
  exatamente igual.
- Nenhuma outra página, nenhum outro componente.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```
Conferido manualmente (via grep) que nenhuma referência antiga de CSS
ficou órfã, inclusive nos breakpoints responsivos existentes.

## Limitação honesta
Não tenho como tirar um screenshot real do resultado renderizado neste
ambiente (sem navegador disponível para isso) — a validação aqui é de
código (compila, sem erros, sem CSS quebrado), não visual. O teste visual
final depende de você abrir o site depois do deploy.

## Teste funcional recomendado
1. Abrir `aura-argus.vercel.app` (fora do dashboard, a landing pública).
2. Confirmar que o título usa a fonte técnica com contorno ciano em vez
   do degradê colorido antigo.
3. Confirmar que os avatares aparecem como fotos em corte diagonal, com
   "AURA"/"ARGUS" escrito no canto superior esquerdo de cada card.
4. Confirmar que a respiração sutil da imagem e a chuva de binário no
   fundo continuam funcionando como antes.

## Status
Implementado e validado por build. Teste visual real pendente de
confirmação de Paulo.
