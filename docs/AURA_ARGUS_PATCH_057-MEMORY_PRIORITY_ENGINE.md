# AURA_ARGUS_PATCH_057 - MEMORY_PRIORITY_ENGINE

## Objetivo
Consolidar a priorização das memórias do AURA/ARGUS, garantindo que decisões do projeto, próxima etapa, banco, framework, deploy e modelos de IA tenham prioridade sobre preferências pessoais ou registros secundários.

## Problemas corrigidos
- Memórias pessoais podiam competir com decisões técnicas do projeto.
- Fatos importantes podiam aparecer depois de registros menos relevantes.
- O prompt da memória não deixava explícita a ordem de prioridade.
- A memória local do chat não era ordenada por importância antes de ser enviada ao modelo.

## Arquivos alterados
- `lib/memory/server.ts`
- `app/dashboard/chat/page.tsx`

## Alterações realizadas
- Criado score de prioridade para memórias persistentes.
- Criado score de prioridade para memórias locais do chat.
- Priorizados: próxima etapa, decisões, Supabase, Vercel, Next.js, Claude, Gemini, objetivo do projeto.
- Rebaixadas memórias pessoais de baixa relevância, como cor favorita.
- O prompt do Memory Engine agora informa a regra de prioridade ao modelo.
- Registros corrompidos continuam sendo filtrados.

## Impacto esperado
AURA e ARGUS devem responder dando prioridade aos fatos estruturais do projeto antes de preferências pessoais ou informações secundárias.

## Teste funcional direto no site
1. Abrir Chat IA.
2. Informar:
   - `Minha cor favorita é azul.`
   - `Meu banco principal é Supabase.`
   - `A próxima etapa deste projeto é concluir o Action Engine operacional.`
3. Perguntar:
   - `Qual é a próxima etapa deste projeto e qual banco estou usando?`
4. Resultado esperado:
   - A resposta deve priorizar `Action Engine operacional` e `Supabase`.
   - A cor favorita não deve aparecer, a menos que seja perguntada diretamente.

## Critérios de aceite
- A próxima etapa aparece antes de preferências pessoais.
- Supabase, Vercel, Next.js, Claude e Gemini continuam sendo recuperados.
- AURA e ARGUS não confundem fatos técnicos com preferências pessoais.
- A interface visual permanece inalterada.

## Status
Pronto para validação no site.
