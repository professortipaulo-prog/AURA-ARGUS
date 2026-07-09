# Módulo: faceid

**Status: parcialmente implementado (PATCH_096).**

Já funciona de verdade (fora deste diretório por enquanto):
- Consentimento explícito antes de qualquer acesso à câmera.
- Captura do rosto via `face-api.js` (roda no navegador do usuário).
- Apenas o **descritor matemático** (vetor de 128 números) é enviado e
  guardado no servidor — nunca a foto ou o vídeo. O descritor não
  permite reconstruir a imagem do rosto.
- Interface em `/dashboard/settings` — ativar, ver status, remover a
  qualquer momento.
- Login por senha nunca é afetado — reconhecimento facial é sempre um
  atalho opcional, adicional.

## Pendente (decisão consciente, não esquecimento)
- **Login usando o rosto** (verificação 1:1 contra o descritor
  cadastrado, sem digitar senha) — decidido deliberadamente NÃO
  implementar ainda nesta sessão, porque envolve criar uma sessão de
  autenticação sem senha, o que é uma área de alto risco de segurança
  (uma falha aqui poderia permitir acesso indevido a contas). Precisa de
  desenho e revisão mais cuidadosos antes de mexer no fluxo de login
  real.
- Extrair a lógica de `lib/face/server.ts` para viver dentro deste
  módulo, seguindo o padrão completo dos outros módulos implementados.
