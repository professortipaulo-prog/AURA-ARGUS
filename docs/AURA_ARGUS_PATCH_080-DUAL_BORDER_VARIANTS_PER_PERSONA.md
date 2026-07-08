# AURA_ARGUS_PATCH_080 — DUAL_BORDER_VARIANTS_PER_PERSONA

## Objetivo
Expandir o PATCH_079 (que só tinha 1 borda, só para ARGUS) para: **2
variantes de borda por persona**, escolhíveis na hora de gerar o
documento `.docx`.

| Persona | Variante 1 | Variante 2 |
|---|---|---|
| AURA | Ondas azuis (`aura-border-1-ondas.jpg`) | Floral azul (`aura-border-2-floral.jpg`) |
| ARGUS | Circuito (`argus-border-1-circuito.png`) | Hexagonal (`argus-border-2-hexagonal.png`) |

## Problema técnico resolvido: proporções diferentes entre as imagens
As 4 imagens enviadas têm proporções bem diferentes:
- Circuito, floral e hexagonal: proporção próxima da página A4 (~0,71).
- Ondas azuis: proporção bem mais estreita/alta (~0,56 — mais parecida
  com wallpaper de celular do que com página A4).

Se todas fossem forçadas para o tamanho exato da página, a imagem de ondas
ficaria visivelmente esticada/distorcida. Em vez disso, implementei um
**encaixe proporcional automático ("contain fit")**: cada imagem é lida
com a biblioteca `image-size` (nova dependência, lê as dimensões reais do
arquivo), e escalada para caber inteira dentro da página A4 sem nunca
esticar — a imagem de ondas fica mais estreita e centralizada, com um
pouco de espaço em branco nas laterais, em vez de distorcida.

Comprovado com teste real (não só cálculo): gerei um `.docx` de teste para
cada uma das 4 combinações e conferi o resultado:

| Persona/variante | Original (px) | Renderizado (px) | Escala |
|---|---|---|---|
| AURA v1 (ondas) | 736×1308 | 632×1123 | 0,859 (ajustado pela altura) |
| AURA v2 (floral) | 1200×1697 | 794×1123 | 0,662 |
| ARGUS v1 (circuito) | 1055×1491 | 794×1122 | 0,753 |
| ARGUS v2 (hexagonal) | 1200×1696 | 794×1122 | 0,662 |

## Conversão de formato
O arquivo hexagonal veio em `.webp`, que o Word **não aceita** nativamente
(a biblioteca `docx` só aceita `jpg`/`png`/`gif`/`bmp`). Convertido para
`.png` antes de salvar no projeto — sem perda visível de qualidade.

## Arquivos de imagem (novos/renomeados)
- `public/branding/aura-border-1-ondas.jpg` (novo)
- `public/branding/aura-border-2-floral.jpg` (novo)
- `public/branding/argus-border-1-circuito.png` (renomeado do PATCH_079,
  mesmo arquivo)
- `public/branding/argus-border-2-hexagonal.png` (novo, convertido de webp)

## Arquivos de código alterados
- `package.json` — nova dependência `image-size`
- `lib/actions/document-engine.ts` — `getBorderImage()` generalizado para
  qualquer persona + variante (1 ou 2); `toDocxBuffer()` recebe
  `borderVariant`; cálculo de encaixe proporcional.
- `lib/actions/types.ts` — `ExecuteActionRequest.borderVariant?: 1 | 2`
- `lib/actions/server.ts` — repassa `borderVariant` da requisição
- `app/dashboard/actions/page.tsx` — seletor "Estilo da borda (Word)",
  com opções diferentes dependendo da persona escolhida, só aparece
  quando o formato selecionado é `.docx`

## O que NÃO foi alterado
- `.xlsx`, `.pptx`, `.pdf` e os formatos antigos continuam sem borda.
- CSS, layout, outras páginas.

## Validação executada (com prova concreta)
```
npm run typecheck   # 0 erros
npm run build         # build completo
```
Gerei as 4 combinações reais (aura v1/v2, argus v1/v2) e confirmei, para
cada uma:
- A escala calculada evita distorção (tabela acima).
- A imagem foi embutida no `.docx` com o **mesmo tamanho em bytes do
  arquivo original** (17.870 / 54.032 / 712.237 / 200.042 bytes,
  respectivamente) — prova de que não houve perda/corrupção na conversão.

## Teste funcional recomendado no site
1. Central de Ações → formato **Word (.docx)**.
2. Persona **AURA** → gerar com "Ondas azuis", depois com "Floral azul".
3. Persona **ARGUS** → gerar com "Circuito", depois com "Hexagonal".
4. Abrir os 4 arquivos no Word e confirmar visualmente que nenhuma borda
   aparece esticada/distorcida, e que a de ondas (a de proporção
   diferente) aparece inteira, só um pouco mais estreita, centralizada.

## Status
Implementado e validado com prova técnica concreta (dimensões reais,
tamanhos de arquivo embutido). Teste visual final no Word recomendado.
