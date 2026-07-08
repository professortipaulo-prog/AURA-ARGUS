# AURA_ARGUS_PATCH_079 — ARGUS_DOCX_PAGE_BORDER

## Objetivo
Aplicar a arte de borda (circuito, estilo técnico) enviada por Paulo como
moldura decorativa padrão em todas as páginas dos documentos `.docx`
gerados pela persona ARGUS.

## Arquivo de imagem
- `public/branding/argus-page-border.png` (712 KB, 1055×1491px — mesma
  proporção do A4, então escala sem distorcer).

## Como funciona
- `toDocxBuffer()` agora aceita um parâmetro opcional `persona`.
- Quando `persona === 'argus'`, a imagem é lida do disco (com cache em
  memória entre chamadas, para não reler o arquivo a cada geração) e
  inserida como uma imagem **flutuante, atrás do texto** (`behindDocument`),
  dentro do cabeçalho do documento (`Header`) — como cabeçalho se repete em
  toda página do Word automaticamente, a borda aparece em todas as páginas
  sem precisar duplicar nada.
- A página foi fixada em tamanho **A4** (`11906 × 16838` twips) para bater
  com a proporção da imagem enviada.
- Quando `persona !== 'argus'` (ou não informada), o comportamento é
  **idêntico ao de antes** — nenhuma borda, documento normal.
- Se o arquivo de imagem não for encontrado por qualquer motivo em
  produção, a função captura o erro e segue gerando o documento sem borda,
  em vez de quebrar a geração inteira.

## Arquivos alterados
- `public/branding/argus-page-border.png` (novo arquivo binário)
- `lib/actions/document-engine.ts` (`toDocxBuffer`, `createDocumentArtifact`)
- `lib/actions/server.ts` (repassa `request.persona` para
  `createDocumentArtifact`)
- `app/dashboard/actions/page.tsx` (novo seletor "Persona / marca do
  documento" — AURA ou ARGUS — para poder escolher e testar a borda)

## O que NÃO foi alterado
- Documentos gerados como AURA continuam exatamente iguais.
- `.xlsx`, `.pptx`, `.pdf`, e os formatos antigos (`md`/`html`/`txt`/`csv`/
  `json`/`svg`/`doc`) — nenhum ganhou borda, só o `.docx` do ARGUS, como
  pedido.
- CSS, layout, outras páginas.

## Validação executada (com prova concreta, não só compilação)
```
npm run typecheck   # 0 erros
npm run build         # build completo
```
Gerei um `.docx` de teste de verdade e abri o ZIP interno (todo `.docx` é
um ZIP por dentro) para confirmar, sem depender de abrir no Word:
- A imagem está de fato embutida em `word/media/` — **712.237 bytes,
  idêntico ao arquivo original enviado por Paulo** (prova de que não houve
  corrupção/perda de dados na conversão).
- O XML do cabeçalho (`word/header1.xml`) contém `wp:anchor` e
  `behindDoc="1"` — a configuração exata de "imagem flutuante atrás do
  texto" que o Word usa para esse tipo de moldura decorativa.

## Teste funcional recomendado no site
1. Ir em Central de Ações → escolher **Word (.docx)**.
2. No seletor "Persona / marca do documento", escolher **ARGUS**.
3. Gerar e baixar o arquivo, abrir no Microsoft Word (ou Google Docs).
4. Confirmar visualmente que a borda de circuito aparece ao redor de toda
   página, atrás do texto, sem atrapalhar a leitura.
5. Gerar de novo com persona **AURA** e confirmar que continua sem borda,
   como antes.

## Status
Implementado e validado com prova técnica concreta (inspeção do ZIP
interno do `.docx`). Teste visual final de abertura no Word recomendado
para confirmar a aparência exata.
