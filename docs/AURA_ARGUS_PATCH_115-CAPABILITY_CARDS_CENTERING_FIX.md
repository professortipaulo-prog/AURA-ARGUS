# AURA_ARGUS_PATCH_115 — CAPABILITY_CARDS_CENTERING_FIX

## Objetivo
Corrigir o mesmo padrão de bug do PATCH_114, agora nos 4 cards de
capacidades ("Inteligência contextual", "Análise operacional", "Produção
assistida", "Integração total") — reportado por Paulo com print, mostrando
o mesmo sintoma: bloco limitado em largura, grudado à esquerda, espaço
vazio sobrando à direita.

## Causa raiz (idêntica ao PATCH_114)
`.psfhome-card-grid` tinha `max-width: 660px` sem `margin: 0 auto` —
mesmo padrão exato do bug dos avatares: um bloco mais estreito que seu
espaço disponível, sem instrução de centralizar, sempre gruda no início
(esquerda).

## Correção aplicada
`margin: 0 auto` adicionado (substituindo o `margin-top: 34px` antigo por
`margin: 34px auto 0`, preservando o espaçamento superior que já
existia).

## Verificação adicional feita antes de finalizar
Busquei por todo o CSS da landing outros elementos com o mesmo padrão
(`max-width` sem `margin: auto`), para não deixar passar mais nenhum:
- Título principal e parágrafo de introdução (`.psfhome-copy h1`,
  `.psfhome-lead`): têm `max-width`, mas são texto alinhado à esquerda
  por convenção normal de leitura — não são bugs, não devem ser
  centralizados.
- Parágrafo dentro do card "Anagrama" (`.psfhome-anagram p`): o card em
  si (`.psfhome-anagram`) já usa `justify-items: center; text-align:
  center`, sem `max-width` próprio — já está correto.

Conclusão: eram só os 2 elementos já corrigidos (avatares no PATCH_114,
cards de capacidade neste patch) — não há mais nenhum caso pendente
desse mesmo padrão de bug na landing.

## Arquivo alterado
- `app/globals.css` (`.psfhome-card-grid`, uma linha)

## O que NÃO foi alterado
- Título, parágrafo de introdução, card do Anagrama — confirmados
  corretos, não precisavam de mudança.
- Tema claro/escuro — inalterado.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Subir o arquivo.
2. Abrir a landing e confirmar que os 4 cards de capacidades agora
   centralizam dentro do espaço disponível, sem espaço vazio só de um
   lado.

## Status
Implementado e validado por build, com verificação proativa de que não
há mais nenhum caso similar pendente na página.
