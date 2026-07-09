# AURA_ARGUS_PATCH_091 — KNOWLEDGE_CONTEXT_TRUNCATION_FIX

## Objetivo
Corrigir a causa raiz confirmada do problema "IA não sabe sobre minhas
publicações" — usando o endpoint de debug do PATCH_090, chegamos à causa
exata, sem mais suposição.

## Causa raiz confirmada
`getKnowledgeContext()` cortava o texto de cada arquivo em **3.000
caracteres** antes de enviar para a IA:
```ts
item.text.slice(0, 3000)
```

O currículo de Paulo tem **7.596 caracteres** extraídos no total. A
seção "Publicações" (com os nomes dos livros e artigos) fica perto do
**final** do documento — bem depois do corte de 3.000. A IA nunca recebia
essa parte do texto; por isso respondeu, de forma tecnicamente honesta
mas incompleta, que não encontrou menções a publicações — ela realmente
não tinha essa informação disponível, porque foi cortada antes de chegar
até ela.

A resposta do ARGUS ("Em análise ao `Curriculo Paulo 2026.2.1.pdf`...")
confirmou que o arquivo certo estava sendo consultado — só que
parcialmente.

## Correção aplicada
Limite por arquivo aumentado de 3.000 para **20.000 caracteres** — cobre
o currículo inteiro (7.596 caracteres) com folga considerável, e a
maioria dos documentos pessoais de poucas páginas (notas, currículos,
relatórios curtos).

## Arquivo alterado
- `lib/knowledge/server.ts` (uma linha)

## O que NÃO foi alterado
- Extração de texto, algoritmo de busca por palavra-chave, upload,
  interface — nada disso tinha problema, só o corte no fim do processo.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## ⚠️ Limitação honesta — ainda existe um limite
20.000 caracteres cobre bem documentos pessoais curtos/médios (currículos,
notas, relatórios de poucas páginas). Um documento muito grande (ex: um
livro inteiro, um manual de centenas de páginas) ainda seria cortado.
Isso é uma limitação conhecida do desenho atual (v1, sem chunking
inteligente) — se algum dia isso for um problema real, a solução correta
é dividir documentos grandes em pedaços e buscar só os pedaços relevantes
(chunking + busca), não só aumentar o número de novo. Registrado como
possível próxima evolução, não implementado agora por não ser necessário
para o caso de uso atual.

## Teste funcional recomendado
1. Subir `lib/knowledge/server.ts`.
2. Aguardar o deploy terminar.
3. Perguntar de novo no Chat IA: "Quantas publicações eu tenho e quais os
   nomes?"
4. Confirmar que agora a resposta lista as publicações reais do currículo
   (os 2 livros na Amazon KDP e os 3 artigos de TCC).

## Status
Corrigido com causa raiz 100% confirmada via endpoint de debug (não é
mais suposição). Teste final recomendado para fechar com certeza total.
