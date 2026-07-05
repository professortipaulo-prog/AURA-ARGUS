# AURA_ARGUS_PATCH_061 — MEMORY_COUNTERS_AUDIT_AND_SYNC

## Objetivo
Sincronizar os contadores da página **Memória** com a fonte real utilizada atualmente pelo Chat IA, sem alterar visual, CSS, animação, login, landing ou bloqueios de cadastro.

## Diagnóstico
Os testes comprovaram que AURA e ARGUS recuperam corretamente informações como:

- banco principal: Supabase;
- deploy: Vercel;
- framework: Next.js 14;
- próxima etapa: concluir o Action Engine operacional.

Ao mesmo tempo, os cards da página **Memória** continuavam zerados. Isso indica que o Chat estava utilizando uma camada local de memória/contexto enquanto os cards consultavam apenas o endpoint Supabase.

## Correção aplicada
- A página `/dashboard/memory` passa a ler os contadores do endpoint `/api/memory/status` e, quando eles estiverem zerados, usa também o fallback local já utilizado pelo Chat.
- O layout da página Memória foi preservado.
- Nenhuma classe CSS foi alterada.
- Nenhuma animação do Chat foi alterada.
- Nenhum bloqueio de login/register foi alterado.
- `lib/memory/server.ts` mantém contagem segura no backend, com fallback para message_count quando necessário.

## Arquivos alterados
- `app/dashboard/memory/page.tsx`
- `app/api/memory/status/route.ts`
- `lib/memory/server.ts`

## Teste funcional direto no site
1. Abrir **Chat IA**.
2. Enviar:
   ```text
   Meu banco principal é Supabase.
   A próxima etapa deste projeto é concluir o Action Engine operacional.
   ```
3. Aguardar a resposta.
4. Abrir **Memória**.
5. Usar Ctrl + F5.
6. Verificar se os cards deixam de ficar zerados.

## Critérios de aceite
- Página Memória mantém o visual aprovado.
- Chat mantém a animação de processamento.
- Login/register continuam bloqueados.
- Cards de Memória mostram valores maiores que zero quando houver conversa/memória local ou persistida.

## Observação técnica
Este patch é uma ponte de estabilização. O próximo passo estrutural deve ser eliminar a dependência da memória local como fonte principal e garantir que toda conversa salva pelo Chat seja refletida de ponta a ponta no Supabase.
