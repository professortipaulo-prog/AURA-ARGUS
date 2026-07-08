# AURA_ARGUS_PATCH_082 — FOOTER_COPYRIGHT_AND_CONTACT

## Objetivo
Adicionar ao rodapé da landing: crédito de desenvolvimento, ano, aviso de
direitos reservados e link de contato.

## O que foi adicionado
Nova linha no rodapé:
"Desenvolvido por Paulo da Silva Filho © 2026. Todos os direitos
reservados. · Contato" (link para https://profpaulofilho.github.io/,
abre em nova aba).

## Arquivos alterados
- `app/page.tsx` (nova linha no `<footer>`)
- `app/globals.css` (estilo do link dentro do rodapé — antes os links
  herdavam a cor neutra do texto ao redor e não tinham sublinhado, o que
  tornaria o link de contato praticamente invisível como link clicável)

## O que NÃO foi alterado
- Layout do rodapé, outras páginas, CSS global fora do escopo do rodapé.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Status
Implementado e validado nesta sessão.
