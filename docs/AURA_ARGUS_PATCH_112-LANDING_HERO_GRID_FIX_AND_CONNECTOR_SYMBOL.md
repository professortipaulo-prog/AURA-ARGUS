# AURA_ARGUS_PATCH_112 — LANDING_HERO_GRID_FIX_AND_CONNECTOR_SYMBOL

## Objetivo
Corrigir o espaço vazio à direita dos avatares na landing (reportado por
Paulo com print), adicionar um símbolo de integração/colaboração entre
AURA e ARGUS, e reforçar o enquadramento consistente dos avatares na
Central de Operações.

## 1) Causa raiz do espaço vazio na landing — confirmada
O grid do herói (`.psfhome-hero`) estava definido com **3 colunas**:
```css
grid-template-columns: minmax(0, .95fr) minmax(420px, .9fr) minmax(360px, .7fr);
```
Mas a seção só tem **2 elementos** de verdade (`.psfhome-copy` com o
texto, e `.psfhome-avatars` com os cards) — a terceira coluna nunca teve
conteúdo, e ficava como espaço morto à direita. É exatamente o "espaço
sobrando" que aparece no print.

**Correção:** grid ajustado para 2 colunas, batendo com os 2 elementos
reais:
```css
grid-template-columns: minmax(0, 1fr) minmax(420px, .85fr);
```

## 2) Símbolo de integração/colaboração entre AURA e ARGUS
Adicionado um pequeno badge circular entre os dois cards, com um ícone
de "⇄" (troca/colaboração), brilho pulsante sutil na cor de destaque —
reforça visualmente a ideia de "duas mentes, uma missão" já presente no
texto do herói. O grid de `.psfhome-avatars` passou de 2 para 3 colunas
(avatar / símbolo / avatar) para acomodar isso, com o símbolo ocupando
uma coluna estreita (`auto`) no meio.

Em telas pequenas (celular), o símbolo se reposiciona entre os cards
empilhados, em vez de ficar ao lado.

## 3) Central de Operações — reforço de enquadramento consistente
Análise matemática do recorte circular (`object-fit: cover` numa moldura
quadrada de 220px): como as duas fotos (`aura.webp`, `argus.webp`) têm a
mesma largura (360px), o corte só acontece na vertical — não deveria
haver diferença horizontal entre as duas por conta da imagem em si.
Ainda assim, adicionado `object-top` explicitamente (em vez de depender
do posicionamento padrão do navegador), para garantir o mesmo
enquadramento vertical consistente nas duas personas, sem ambiguidade.

**Nota honesta:** não consegui visualizar os prints diretamente nesta
sessão (problema técnico pontual do meu lado) — a correção foi aplicada
com base em análise de código/matemática do recorte, não em comparação
visual direta. Se a assimetria persistir depois deste patch, preciso de
mais detalhe (ex: inspecionar elemento no navegador) para continuar
sem chutar.

## Sobre o tema claro/escuro
**Nada foi alterado** relacionado ao interruptor de tema — as mudanças
deste patch (grid da landing, símbolo conector, enquadramento do avatar)
não têm nenhuma sobreposição com essa lógica.

## Arquivos alterados
- `app/page.tsx` (símbolo conector entre os avatares)
- `app/globals.css` (grid do herói corrigido; grid dos avatares e estilo
  do símbolo conector; `object-position` explícito no avatar do
  dashboard)
- `components/avatar-panel.tsx` (`object-top` explícito)

## O que NÃO foi alterado
- Tema claro/escuro — zero alterações, por precaução explícita pedida
  por Paulo.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test          # 19 testes, todos passando
npm run build          # build completo
```

## Teste funcional recomendado
1. Subir os 3 arquivos.
2. Abrir a landing pública e confirmar que o espaço vazio à direita dos
   avatares sumiu, e que aparece o símbolo "⇄" entre AURA e ARGUS.
3. Verificar a Central de Operações, alternando entre AURA e ARGUS, e
   confirmar se a foto aparece centralizada da mesma forma nos dois
   casos. Se ainda notar diferença, um print com a ferramenta de
   inspecionar elemento do navegador (mostrando as dimensões reais)
   ajudaria a fechar isso com certeza, em vez de eu continuar chutando.
4. Confirmar que o botão de tema claro/escuro continua funcionando
   exatamente como antes.

## Status
Implementado e validado por build. Correção da landing (causa raiz
clara, CSS). Correção do avatar do dashboard aplicada por precaução/
análise matemática, sem confirmação visual direta nesta sessão.
