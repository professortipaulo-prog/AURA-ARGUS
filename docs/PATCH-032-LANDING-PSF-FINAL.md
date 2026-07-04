# PATCH 032 — Landing PSF Final

Escopo: somente tela inicial antes do login.

Arquivos alterados:
- app/page.tsx
- app/globals.css

Correções:
- remove estado de texto cru da landing;
- aplica estrutura visual inspirada no site PSF;
- mantém fundo escuro premium;
- aplica efeito Matrix/binários animados;
- destaca AURA e ARGUS com avatares individuais;
- remove imagem antiga do dashboard da landing;
- preserva botões Entrar e Criar perfil;
- não altera chat, dashboard, login, Supabase, APIs ou banco.

Validação:
- npx tsc --noEmit: OK.
- next build compilou, mas a coleta final foi interrompida por timeout do ambiente local após compile; não houve erro TypeScript.
