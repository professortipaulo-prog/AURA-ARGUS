# AURA_ARGUS_PATCH_090 — KNOWLEDGE_DEBUG_ENDPOINT

## Objetivo
Diagnosticar por que a IA respondeu "não sabia" mesmo com um arquivo
(PDF) já enviado e supostamente processado — sem continuar adivinhando
às cegas, criei um endpoint de debug real, no mesmo padrão que já
resolveu o bug de memória em sessão anterior (/api/memory/debug).

## O que foi criado
Nova rota: `GET /api/knowledge/debug?q=sua+pergunta+aqui`

Retorna, para o usuário logado:
- Lista de todos os arquivos enviados, com status de extração, tamanho
  do texto extraído, e uma prévia de até 300 caracteres do texto
  (permite ver se o PDF realmente foi lido, e como o texto ficou).
- O resultado exato que `getKnowledgeContext()` (a função usada pelo
  Chat IA e pela geração de documentos) encontra para uma pergunta de
  teste — usando "experiencia profissional carreira" como padrão, ou
  qualquer pergunta que você passar em `?q=`.

## Arquivo novo
- `app/api/knowledge/debug/route.ts`

## Como usar
1. Logado no site, acesse:
   `https://aura-argus.vercel.app/api/knowledge/debug?q=quantos anos de experiencia`
2. Me mande o JSON completo que aparecer.

Isso mostra, sem sombra de dúvida:
- Se o PDF foi realmente lido (`extractionStatus: "done"` e
  `extractedTextLength` maior que zero).
- Se o texto extraído faz sentido (prévia legível, não corrompido).
- Se a busca por palavra-chave está encontrando esse arquivo pra sua
  pergunta (`contextIsNull: false` significa que encontrou algo).

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Status
Ferramenta de diagnóstico pronta — aguardando o resultado real para
saber se o problema é na extração do PDF ou na busca de contexto.
