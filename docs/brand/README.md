# Referência de marca — AURA / ARGUS

`aura-argus-reference.png` é o material de branding fornecido pelo
Product Owner: paleta violeta → ciano, ícone de hexágono com "olho" e
retratos de referência das personas AURA e ARGUS.

Usado nesta sprint para:

- `components/brand/logo-mark.tsx` — logo em SVG (hexágono + olho,
  gradiente `#7C3AED → #22D3EE`), substituindo o placeholder de
  letra usado na Sprint 005.
- `tailwind.config.ts` — cores `brand.violet`, `brand.indigo`, `brand.cyan`.
- `components/avatar-panel.tsx` — gradientes das personas ajustados
  para ficarem mais próximos da referência.

Os retratos fotográficos de AURA e ARGUS na imagem são material de
apresentação/marketing — não foram reproduzidos como avatar animado
nesta sprint. O Avatar Engine real (SVG/Canvas animado com estados e
lip-sync) continua sendo trabalho futuro de `modules/avatar` (ver
Sprint-002.md §9).
