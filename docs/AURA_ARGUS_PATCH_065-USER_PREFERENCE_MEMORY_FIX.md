# AURA_ARGUS_PATCH_065 — USER_PREFERENCE_MEMORY_FIX

## Objetivo
Corrigir a falha em que preferências pessoais simples, especialmente cor favorita/preferida, eram registradas no chat, mas não eram recuperadas na pergunta seguinte.

## Problema corrigido
O sistema respondia "Anotado" para frases como "Gosto de azul", mas depois respondia que não havia registro ao perguntar "Qual minha cor favorita?".

## Arquivos alterados
- `app/dashboard/chat/page.tsx`
- `lib/memory/server.ts`

## Alterações realizadas
- Reforçada a extração local de preferências pessoais no Chat.
- Incluída resposta determinística para perguntas diretas sobre preferências já registradas no navegador/sessão.
- Incluída preferência pessoal como bloco explícito no prompt de memória do backend.
- Aumentada prioridade de memórias do tipo preferência/cor favorita no backend.
- Ajustado conteúdo persistido para registrar "cor favorita/preferida de Paulo" de forma clara.

## O que NÃO foi alterado
- CSS global.
- Layout do Chat.
- Animação de processamento.
- Layout da Memória.
- Login.
- Register.
- Landing.

## Teste funcional direto no site
1. Abrir Chat IA.
2. Enviar: `Gosto de azul.`
3. Perguntar: `Qual minha cor favorita?`

## Resultado esperado
AURA ou ARGUS deve responder: `Sua cor favorita/preferida é azul.` ou equivalente.

## Status
Patch corretivo de regressão funcional da memória de preferências pessoais.
