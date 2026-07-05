# PATCH 046 — MEMORY/UI STABILIZATION

## Objetivo
Estabilizar a memória operacional do AURA/ARGUS antes de qualquer novo módulo.

## Escopo aplicado
- Restaura o layout visual de `/dashboard/memory` usando o shell visual existente.
- Corrige persistência real de conversas no Supabase.
- Registra sessões em `ai.sessions`.
- Registra mensagens do usuário e respostas da IA em `ai.messages`.
- Registra memórias de projeto em `memory.items` quando a conversa contém informação persistente do projeto.
- Recupera memórias do projeto antes da IA responder.
- Injeta data, hora, timezone e tempo restante do dia no prompt de AURA e ARGUS.
- Mantém o visual aprovado do Chat IA.
- Atualiza contadores em Memória e Projetos.
- Adiciona `favicon.ico` e `favicon.svg` sem alterar a landing page.

## Arquivos alterados/criados
- `app/api/ai/chat/route.ts`
- `app/dashboard/chat/page.tsx`
- `app/dashboard/memory/page.tsx`
- `app/dashboard/projects/page.tsx`
- `app/layout.tsx`
- `app/favicon.ico`
- `app/favicon.svg`
- `lib/memory/server.ts`
- `lib/memory/types.ts`

## Teste direto no site
1. Entrar no site.
2. Abrir **Memória**.
3. Confirmar se a página aparece com layout visual correto, cards e contadores.
4. Abrir **Chat IA**.
5. Perguntar: `Qual data é hoje e quantas horas faltam para terminar o dia?`
6. Testar em AURA e ARGUS.
7. Enviar: `Neste projeto, a próxima etapa é concluir o Action Engine operacional.`
8. Perguntar: `Qual é a próxima etapa deste projeto?`
9. Abrir **Projetos** e confirmar se os contadores saíram de zero.
10. Abrir **Memória** e confirmar se sessões, mensagens e memórias saíram de zero.

## Observação operacional
Este patch depende das variáveis Supabase já existentes na Vercel e dos schemas `core`, `ai` e `memory` estarem disponíveis conforme a base ARQ-DB-001 do projeto.
