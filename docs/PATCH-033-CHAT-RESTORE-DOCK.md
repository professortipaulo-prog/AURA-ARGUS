# PATCH 033 — Chat Restore Dock

Escopo: somente chat.

Arquivos alterados:
- app/dashboard/chat/page.tsx
- app/globals.css

Correções:
- Remove imagem gigante de fundo do ARGUS/AURA no chat.
- Recria dock superior com AURA e ARGUS.
- Avatar ativo fica iluminado; avatar inativo fica opaco.
- Área de mensagens fica separada e com scroll próprio.
- Campo de texto fica fixo na base do card.
- Enter envia; Shift + Enter quebra linha.
- Placeholder acompanha a persona ativa.
- Persona enviada para API fica travada no momento do envio.
- ARGUS não deve responder como AURA e AURA não deve responder como ARGUS.

Observação: este patch não altera Landing, Login, Dashboard, Supabase, APIs ou banco.
