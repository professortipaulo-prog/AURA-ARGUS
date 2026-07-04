# PATCH 037 — Final UX Scale, Landing Meaning and Chat Polish

## Escopo

Altera somente:

- `app/page.tsx`
- `app/globals.css`
- `app/dashboard/chat/page.tsx`

## Ajustes

- Adiciona definições oficiais no anagrama da landing:
  - AURA: Assistente Universal de Raciocínio e Ação.
  - ARGUS: Assistente de Raciocínio, Gestão, Unificação e Supervisão.
- Adiciona resumo breve dos paralelos mitológicos.
- Menu `Assistentes` passa a rolar direto para a área dos protagonistas.
- Compacta a escala geral do dashboard para 1920x1080 em zoom 100%.
- Mantém o chat na escala aprovada, com melhoria fina de proporções.
- Remove mensagem automática ao alternar AURA/ARGUS.
- Mantém troca de persona, cor e estado visual sem poluir a conversa.
- Avatares no chat ficam maiores e sem círculo duplicado.
- Campo do chat fica menor e autoexpansível.

## Não altera

- APIs
- Supabase
- Banco de dados
- Login
- Rotas de autenticação
