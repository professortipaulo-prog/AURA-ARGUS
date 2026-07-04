# PATCH 035 — Chat Viewport Final

Escopo restrito ao chat e estilos globais necessários.

Arquivos:
- app/dashboard/chat/page.tsx
- app/globals.css

Ajustes:
- Move o seletor AURA/ARGUS para o header do chat.
- Mantém os avatares sempre visíveis, fora da rolagem da conversa.
- Aumenta a largura útil do chat para telas Full HD.
- Aumenta a área de leitura das mensagens.
- Reduz a altura inicial do campo de texto.
- Campo de texto cresce automaticamente conforme o conteúdo, até limite visual.
- Mantém Enter para enviar e Shift + Enter para quebrar linha.
- Mantém Matrix, cores, glow e comportamento atual.

Não altera:
- Landing Page.
- Login.
- Dashboard principal.
- Supabase.
- APIs.
- Banco de dados.
