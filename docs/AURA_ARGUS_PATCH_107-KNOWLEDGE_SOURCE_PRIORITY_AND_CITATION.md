# AURA_ARGUS_PATCH_107 — KNOWLEDGE_SOURCE_PRIORITY_AND_CITATION

## Objetivo
Garantir, de forma explícita nas instruções da IA, duas coisas pedidas
por Paulo: (1) os arquivos enviados pelo usuário (base de conhecimento)
devem sempre ser considerados como fonte prioritária; (2) quando a IA
trouxer informação factual/atual da internet, deve sempre citar a fonte.

## O que foi alterado

### 1) Base de conhecimento — reforço de prioridade
`lib/knowledge/server.ts` (`getKnowledgeContext`): a instrução que
acompanha os arquivos do usuário agora deixa explícito que eles são a
**fonte prioritária** sobre o usuário e seus assuntos, devendo ser
verificados antes de recorrer a conhecimento geral ou busca na web.

### 2) Citação de fontes — regra geral (vale para todo chat)
`lib/memory/server.ts` (`priorityRule`, usada em toda conversa real):
adicionada uma "REGRA GERAL DE FONTES", instruindo a IA a sempre citar a
fonte (nome do site ou link) quando incluir informação obtida por busca
na web, e reforçando a prioridade da base de conhecimento aqui também.

### 3) Documentos gerados — exigência de seção de referências
`lib/actions/server.ts` (brief de elaboração usado no PATCH_085/106):
reescrito com uma ordem de prioridade de fontes explícita (1. base de
conhecimento e memória, 2. busca na web quando necessário) e a exigência
de incluir uma seção final "Referências" ou "Fontes" no documento
sempre que informação da web for usada.

## Arquivos alterados
- `lib/knowledge/server.ts`
- `lib/memory/server.ts`
- `lib/actions/server.ts`

## O que NÃO foi alterado
- Nenhuma lógica de busca na web, extração de conhecimento, ou geração
  de documentos — só as instruções de texto que orientam a IA.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## ⚠️ Limitação honesta — é ajuste de instrução, não garantia de código
Como já aconteceu com outros ajustes de prompt nesta sessão (ex:
PATCH_092), isto **orienta** a IA a se comportar assim — modelos de
linguagem seguem instruções bem escritas de forma consistente na maioria
das vezes, mas não há como eu garantir 100% em código que isso sempre
vai acontecer, do jeito que garanto uma função testada. Só o teste real
confirma se o comportamento mudou como esperado.

## Teste funcional recomendado
1. Subir os 3 arquivos.
2. Com algum arquivo já na sua Base de Conhecimento, pergunte no chat ou
   peça um documento sobre um assunto coberto por esse arquivo — confirme
   que a resposta usa o conteúdo real dele.
3. Peça um documento sobre um assunto atual que não está nos seus
   arquivos (ex: uma notícia recente) — confirme que o documento inclui
   uma seção de "Referências"/"Fontes" ao final, citando de onde veio a
   informação.

## Status
Implementado e validado por build. Comportamento de IA — depende de
teste real para confirmação, sem garantia absoluta de código puro.
