# AURA_ARGUS_PATCH_089 — PDF_EXTRACTION_SERVERLESS_COMPATIBLE_LIBRARY

## Objetivo
Corrigir definitivamente o erro 500 no upload de arquivos, agora com a
causa raiz confirmada por log real da Vercel (obrigado por conseguir
esse log, foi o que faltava).

## Causa raiz confirmada
```
ReferenceError: DOMMatrix is not defined
    at file:///var/task/node_modules/pdfjs-dist/legacy/build/pdf.mjs:15620:22
```

`pdf-parse` (usado desde o PATCH_086) depende internamente do
`pdfjs-dist`, a biblioteca de PDF do próprio navegador Firefox adaptada
para uso geral. A versão "legacy" que o `pdf-parse` usa por baixo dos
panos espera rodar num navegador — usa APIs como `DOMMatrix`, que só
existem em ambientes com DOM (navegador). O ambiente serverless da Vercel
roda Node puro, sem DOM nenhum, então essa referência quebra assim que o
código tenta usá-la.

Isso confirma exatamente a hipótese do PATCH_088 (o problema era no
carregamento/uso do pdf-parse) — só que a causa era mais profunda do que
"import preguiçoso resolve": mesmo carregando sob demanda, o código
internamente ainda tentava rodar sem DOM disponível.

## Correção aplicada
Troquei `pdf-parse` por **`unpdf`** — uma biblioteca de extração de texto
de PDF construída especificamente para ambientes serverless/edge
(Vercel, Cloudflare Workers, etc.), sem depender de APIs de navegador.

**Testado isoladamente antes de aplicar** (não tomei a palavra da
documentação da biblioteca): gerei um PDF de verdade com `pdf-lib` e
extraí o texto de volta com `unpdf`, em Node puro — exatamente a mesma
restrição de ambiente que quebrou o `pdf-parse` — e funcionou:
```
unpdf extraiu: "Texto de teste para extracao via unpdf."
```

`pdf-parse` foi desinstalado (não é mais usado em lugar nenhum do
projeto).

## Arquivos alterados
- `package.json` / `package-lock.json` (`pdf-parse` removido, `unpdf`
  adicionado)
- `lib/knowledge/server.ts` (branch de extração de PDF reescrita para
  usar `unpdf`)
- `next.config.js` (removida a entrada `pdf-parse` de
  `serverComponentsExternalPackages`, que não existe mais; `mammoth`
  continua lá)

## O que NÃO foi alterado
- Extração de `.docx` (`mammoth`), `.txt`/`.md` — inalteradas, não tinham
  esse problema.
- Todo o resto do Knowledge Hub (upload, storage, banco, busca de
  contexto, interface).

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```
Extração de PDF testada isoladamente em Node puro (sem DOM disponível),
reproduzindo a mesma restrição de ambiente que causou o erro original —
funcionou corretamente.

## Teste funcional recomendado
1. Subir os arquivos deste patch.
2. Aguardar o deploy terminar.
3. Enviar o mesmo `.txt` de antes — deve funcionar (já funcionava desde o
   PATCH_088, mas vale confirmar de novo).
4. Enviar um PDF de verdade — este é o teste que realmente valida esta
   correção. Confirmar que aparece "Pronto para consulta pela IA".
5. Perguntar ao Chat IA algo que só o conteúdo desse PDF responde, e
   confirmar que a resposta reflete o conteúdo real do arquivo.

## Status
Corrigido com causa raiz confirmada por log real (não mais suposição) e
testado isoladamente antes de aplicar. Confiança alta de que resolve —
teste final ao vivo ainda recomendado para fechar com certeza total.
