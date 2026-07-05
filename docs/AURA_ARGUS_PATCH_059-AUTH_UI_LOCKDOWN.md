# AURA_ARGUS_PATCH_059 - AUTH UI LOCKDOWN

## Objetivo
Bloquear visualmente e funcionalmente o cadastro público enquanto o AURA/ARGUS permanece em fase de estabilização.

## Alterações realizadas
- Removido o link "Criar acesso" da tela de login.
- Alterada a página `/register` para uma tela informativa de cadastro em desenvolvimento.
- Mantido botão "Voltar ao Login".
- Desabilitados os CTAs de criação de perfil na landing sem remover o layout.
- Adicionados estilos mínimos para estado desabilitado e retorno ao login.

## Arquivos alterados
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/page.tsx`
- `app/globals.css`

## Teste funcional no site
1. Acessar `/login`.
2. Confirmar que o texto "Ainda não tem conta? Criar acesso" não aparece.
3. Acessar diretamente `/register`.
4. Confirmar a mensagem:
   - Cadastro em desenvolvimento
   - O AURA/ARGUS ainda está em fase de estabilização.
   - O acesso será liberado em breve.
   - Enquanto isso utilize uma conta existente.
5. Clicar em "Voltar ao Login".
6. Confirmar retorno para `/login`.
7. Abrir a landing e confirmar que os botões de criação de perfil estão desabilitados.

## Status
Aprovado para validação em deploy.
