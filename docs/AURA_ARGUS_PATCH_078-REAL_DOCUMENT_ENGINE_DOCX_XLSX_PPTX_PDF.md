# AURA_ARGUS_PATCH_078 — REAL_DOCUMENT_ENGINE_DOCX_XLSX_PPTX_PDF

## Objetivo
Substituir a geração "fingida" de documentos (o antigo formato `doc` era
HTML disfarçado de Word) por geração **nativa e real** de `.docx`, `.xlsx`,
`.pptx` e `.pdf`, usando bibliotecas consolidadas do ecossistema Node —
sem nenhuma credencial externa, sem OAuth.

## Bibliotecas adicionadas
- `docx` (^9.7.1) — geração nativa de Word
- `exceljs` (^4.4.0) — geração nativa de Excel
- `pptxgenjs` (^4.0.1) — geração nativa de PowerPoint
- `pdf-lib` (^1.17.1) — geração nativa de PDF

Todas via `registry.npmjs.org`, sem custo, sem conta externa.

## O que foi implementado
- `DocumentFormat` ganhou 4 novos valores: `docx`, `xlsx`, `pptx`, `pdf` —
  **os formatos antigos continuam existindo intactos** (`md`, `html`,
  `txt`, `csv`, `json`, `svg`, `doc`), nada foi removido.
- `lib/actions/document-engine.ts`: 4 funções novas
  (`toDocxBuffer`, `toXlsxBuffer`, `toPptxBuffer`, `toPdfBuffer`), cada uma
  monta o documento de verdade na biblioteca certa e devolve um `Buffer`
  binário real.
  - **Word:** título como Heading 1 + parágrafos.
  - **Excel:** planilha com colunas "Titulo"/"Linha", uma linha por
    parágrafo do conteúdo.
  - **PowerPoint:** slide de título + um slide por bloco de parágrafo do
    conteúdo.
  - **PDF:** título em negrito + corpo do texto com quebra de linha
    automática (calculada pela largura real da fonte) e paginação
    automática quando o conteúdo não cabe numa página.
- `createDocumentArtifact()` virou assíncrona (as bibliotecas geram os
  buffers de forma assíncrona) — o único chamador
  (`lib/actions/server.ts`) foi ajustado para usar `await`.
- `app/dashboard/actions/page.tsx`: os 4 novos formatos aparecem no
  seletor, com modelo de conteúdo próprio para cada um. O antigo "Word
  compatível" (HTML) continua na lista, renomeado para deixar claro que
  não é o `.docx` nativo novo.

## Arquivos alterados
- `package.json` / `package-lock.json` (novas dependências)
- `lib/actions/types.ts`
- `lib/actions/document-engine.ts`
- `lib/actions/server.ts`
- `app/dashboard/actions/page.tsx`

## O que NÃO foi alterado
- CSS, layout, outras páginas.
- Os formatos antigos (`md`/`html`/`txt`/`csv`/`json`/`svg`/`doc`)
  continuam gerando exatamente como antes.
- Memory Engine, Identity Engine, Voice, avatar — nada disso foi tocado.

## Validação executada (com prova concreta, não só compilação)
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/actions (3.25 kB → 3.54 kB)
```
Testado isoladamente em Node, chamando as 4 bibliotecas de verdade e
conferindo a assinatura binária de cada arquivo gerado:
- `.docx`/`.xlsx`/`.pptx` começam com `PK` (assinatura de arquivo ZIP —
  todos os 3 formatos do Office moderno são, na verdade, ZIPs por dentro).
- `.pdf` começa com `%PDF` (assinatura padrão de PDF).
Testado também o caso de texto longo, forçando quebra de linha e múltiplas
páginas no PDF — funcionou sem erro, gerou 2 páginas corretamente.

## Observação sobre o `npm audit`
A instalação das 4 bibliotecas trouxe 14 avisos de vulnerabilidade em
dependências transitivas (a maioria vindas do `pptxgenjs`, que tem algumas
dependências mais antigas). Não rodei `npm audit fix --force` porque isso
pode trocar versões de forma abrupta e quebrar algo que funciona — fica
registrado aqui como algo a avaliar com calma, não urgente.

## Teste funcional recomendado no site
1. Abrir Central de Ações.
2. Escolher **Word (.docx)**, gerar, baixar, e abrir de verdade no
   Microsoft Word (ou Google Docs) — deve abrir como documento editável
   nativo, não como HTML.
3. Repetir para **Excel (.xlsx)** e confirmar que abre como planilha, com
   as colunas "Titulo"/"Linha".
4. Repetir para **PowerPoint (.pptx)** e confirmar que abre como
   apresentação, com um slide de título e um slide por parágrafo.
5. Repetir para **PDF** e confirmar que abre normalmente, com texto
   legível e quebra de linha correta.

## Status
Implementado e validado com prova concreta (assinatura binária real dos 4
formatos). Teste final de abertura nos programas de verdade (Word, Excel,
PowerPoint, leitor de PDF) recomendado para fechar com certeza total.
