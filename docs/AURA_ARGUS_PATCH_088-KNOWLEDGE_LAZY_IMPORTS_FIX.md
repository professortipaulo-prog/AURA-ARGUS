# AURA_ARGUS_PATCH_088 — KNOWLEDGE_LAZY_IMPORTS_FIX

## Objetivo
Corrigir o mesmo erro 500 do PATCH_087, que persistiu mesmo depois de
marcar `pdf-parse`/`mammoth` como pacotes externos no `next.config.js`.

## Novo dado que mudou o diagnóstico
Paulo testou com um arquivo `.txt` simples (que nem chega a usar
`pdf-parse` nem `mammoth` na lógica) — **e deu o mesmo erro 500,
idêntico**. Isso descarta a hipótese de que o problema estava na
extração em si, e aponta para o carregamento do módulo: como
`lib/knowledge/server.ts` importava `pdf-parse` e `mammoth` no topo do
arquivo (`import { PDFParse } from 'pdf-parse'`), **toda e qualquer
chamada à rota `/api/knowledge/upload` carregava as duas bibliotecas,
mesmo para um `.txt`** — e, se uma delas falhar ao carregar no ambiente
serverless da Vercel, quebra a rota inteira, para qualquer tipo de
arquivo.

Isso também explica por que a resposta de erro era a página genérica do
Next (HTML, `x-matched-path: /500`) e não o JSON que meu código devolve
mesmo em caso de erro real de lógica — erros de import/carregamento de
módulo acontecem **antes** de qualquer `try/catch` meu conseguir rodar.

## Correção aplicada
`pdf-parse` e `mammoth` deixaram de ser importados no topo do arquivo.
Agora são carregados via `import()` dinâmico, **só dentro do trecho que
realmente processa aquele tipo de arquivo**:
```ts
if (mimeType.includes('pdf') || lower.endsWith('.pdf')) {
  const { PDFParse } = await import('pdf-parse');
  ...
}
if (mimeType.includes('wordprocessingml') || lower.endsWith('.docx')) {
  const mammoth = (await import('mammoth')).default;
  ...
}
```
Um upload de `.txt`/`.md` agora **nunca toca** em nenhuma das duas
bibliotecas — só um upload de PDF carrega `pdf-parse`, só um upload de
`.docx` carrega `mammoth`.

## Arquivo alterado
- `lib/knowledge/server.ts` (única alteração — os imports estáticos do
  topo viraram imports dinâmicos dentro de cada branch)

## O que NÃO foi alterado
- `next.config.js` do PATCH_087 continua como está (não atrapalha, e pode
  ainda ser necessário para quando alguém enviar um PDF de verdade).
- Nenhuma outra lógica do Knowledge Hub.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## ⚠️ Ainda não 100% confirmado
Continuo sem acesso ao log real da função na Vercel. Este patch resolve
com alta confiança o caso reportado (`.txt` falhando), porque isola
exatamente a única coisa que era comum entre "enviar PDF" e "enviar TXT"
e que poderia quebrar os dois igualmente. Se **ainda assim** continuar
dando 500 mesmo com um `.txt`, o problema não tem nada a ver com essas
bibliotecas, e aí sim preciso do log real da função (painel Vercel →
Deployments → Runtime Logs) para continuar — não faz mais sentido eu
seguir tentando adivinhar às cegas depois deste patch.

## Teste funcional recomendado
1. Subir `lib/knowledge/server.ts`.
2. Aguardar o deploy terminar.
3. Enviar o mesmo `.txt` que falhou antes.
4. Se funcionar: ótimo, e depois testar também com um PDF/DOCX real para
   confirmar que a extração desses formatos também funciona.
5. Se ainda falhar: pegar o log real da Vercel antes de qualquer nova
   tentativa de correção.

## Status
Correção aplicada com diagnóstico mais forte que o patch anterior (dado
novo e conclusivo: `.txt` falhando isolou a causa). Ainda pendente de
confirmação por teste real.
