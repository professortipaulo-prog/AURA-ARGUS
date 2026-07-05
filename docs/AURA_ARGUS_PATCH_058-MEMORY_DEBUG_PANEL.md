# AURA_ARGUS_PATCH_058 - MEMORY_DEBUG_PANEL

## Objetivo
Adicionar um painel técnico de diagnóstico da memória sem alterar o fluxo aprovado do Chat, Landing, Router ou visual principal.

## Problema tratado
Após a estabilização do Memory Engine, ainda era difícil enxergar exatamente quais memórias eram recuperadas, em qual prioridade e qual bloco de contexto estava sendo enviado ao Prompt Builder.

## Arquivos alterados
- `app/dashboard/memory/page.tsx`
- `app/api/memory/debug/route.ts`
- `lib/memory/server.ts`

## Alterações realizadas
- Criada rota autenticada `/api/memory/debug`.
- Criado export `getMemoryDebug` em `lib/memory/server.ts`.
- Adicionado painel recolhível de diagnóstico na página Memória.
- Exibição de:
  - projeto ativo;
  - data/hora/timezone usados pelo contexto temporal;
  - contadores de sessões, mensagens e memórias;
  - memórias recuperadas por prioridade;
  - prévia técnica do bloco de contexto/prompt.

## Compatibilidade
- Não altera a Landing.
- Não altera a UI do Chat.
- Não altera o AI Router.
- Não muda a persistência da memória.
- Apenas adiciona visibilidade técnica ao Memory Engine.

## Teste funcional direto no site
1. Publicar o patch.
2. Abrir o site.
3. Entrar no Dashboard.
4. Abrir Memória.
5. Clicar em `Abrir diagnóstico`.
6. Verificar se aparecem:
   - projeto ativo;
   - contadores;
   - memórias recuperadas;
   - prévia do Context Builder.

## Critério de aceite
O patch está aprovado quando a tela Memória continua com o layout normal e o painel de diagnóstico permite visualizar as memórias usadas pelo sistema sem quebrar a navegação.

## Validação técnica
- `npx tsc --noEmit` aprovado.
- `npm run build` aprovado.
