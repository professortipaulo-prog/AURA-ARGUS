# Interface AURA/ARGUS — PSF Style com avatares

Esta atualização substitui a landing anterior por uma interface alinhada ao visual do site PSF Editora e Consultoria, com fundo escuro tecnológico, chuva de código, neon azul/verde e uso da imagem dos avatares AURA e ARGUS.

## Alterações

- `app/page.tsx`: nova landing page.
- `app/globals.css`: estilos PSF, animações, HUDs e responsividade.
- `public/avatars/aura-argus-hero.png`: imagem dos avatares.
- `components/product-card.tsx`: card para o ecossistema PSF.
- `public/aura-argus-card.html`: card HTML puro para colar no site PSF.

## Decisão de interface

- Removido CTA direto para dashboard na home.
- Mantidos apenas `Entrar` e `Criar perfil`, pois o painel depende de cadastro/login.
- Avatares aparecem como elemento principal da landing.
- Movimento aplicado por CSS: matrix rain, orbs, respiração dos avatares, pulse ring e equalizador.
