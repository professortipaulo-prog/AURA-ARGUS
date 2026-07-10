# AURA_ARGUS_PATCH_114 — AVATARS_SYMMETRIC_CENTERING

## Objetivo
Corrigir, com base no print real enviado por Paulo: o bloco AURA + símbolo
+ ARGUS tinha um limite de largura (`max-width: 900px` em telas grandes),
mas **não estava centralizado** dentro do espaço disponível — ficava
"grudado" à esquerda, sobrando todo o espaço vazio à direita, em vez de
distribuído dos dois lados. Também aumentada a distância entre os dois
avatares, como pedido.

## Causa raiz
`.psfhome-avatars` tinha `max-width: 900px` (em telas grandes) mas nenhum
`margin: 0 auto` — sem isso, um elemento com largura menor que seu
espaço disponível sempre "gruda" no início (esquerda), em vez de
centralizar. Exatamente o padrão visto no print: AURA começando quase na
borda esquerda da tela, ARGUS logo depois, e um vazio grande à direita.

## Correção aplicada
- `margin: 0 auto` adicionado — agora o bloco inteiro centraliza dentro
  do espaço disponível, e qualquer sobra de espaço se distribui
  **igualmente dos dois lados**, simétrico.
- `gap` entre os avatares aumentado de 18px para 40px — mais distância
  visual entre AURA e ARGUS, como pedido, com o símbolo "⇄" (PATCH_113)
  ficando com mais respiro ao redor.

## Arquivo alterado
- `app/globals.css` (`.psfhome-avatars`, uma linha)

## O que NÃO foi alterado
- O símbolo conector em si (PATCH_113) — continua transparente,
  flutuando, sem cobrir a animação de fundo.
- Tema claro/escuro — inalterado.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Subir o arquivo.
2. Abrir a landing em tela cheia/grande e confirmar que o bloco
   AURA/símbolo/ARGUS agora fica centralizado, com espaço equilibrado
   dos dois lados (não mais só à direita).
3. Confirmar que AURA e ARGUS parecem mais afastados um do outro do que
   antes.

## Status
Implementado e validado por build, com base em causa raiz identificada
diretamente no print real enviado.
