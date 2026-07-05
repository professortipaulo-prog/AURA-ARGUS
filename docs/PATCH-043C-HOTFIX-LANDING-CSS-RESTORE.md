# PATCH 043C — Hotfix Landing CSS Restore

Correção focada apenas na tela inicial pública após o PATCH 043.

## Problema
A Landing Page ficou sem estilos, exibindo texto e imagens em fluxo estático. O PATCH 043 trouxe um `globals.css` focado em Dashboard/Projects e removeu a camada `psfhome-*` usada pela Landing.

## Correção
- Restaura o `app/page.tsx` aprovado da Landing PSF.
- Reaplica os estilos `.psfhome-*` no `app/globals.css` mantendo os estilos de Dashboard/Projetos do PATCH 043.
- Não altera Project Memory, APIs, Supabase, Chat, Login ou rotas.

## Arquivos
- `app/page.tsx`
- `app/globals.css`

## Teste
1. Abrir `/` em 100% no navegador.
2. Confirmar que a Landing volta ao visual PSF com hero, avatares, anagrama e cards estilizados.
3. Abrir `/dashboard/projects` e confirmar que a página de projetos continua funcionando.
