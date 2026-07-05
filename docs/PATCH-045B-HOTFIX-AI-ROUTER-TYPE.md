# PATCH 045B — Hotfix AI Router Type

## Objetivo
Corrigir o erro de build da Vercel:

```text
Type error: Type 'AIRouteDecision' is not assignable to type 'string'.
```

## Causa
O PATCH 045 atualizou `lib/ai/types.ts` e deixou `ChatResponseBody.route` como `string | null`, mas o AI Router do PATCH 042 retorna um objeto `AIRouteDecision`.

## Correção
`ChatResponseBody.route` agora aceita `AIRouteDecision | string | null`, preservando compatibilidade com o roteador automático e com respostas antigas.

## Arquivos alterados
- `lib/ai/types.ts`

## Teste
1. Fazer deploy na Vercel.
2. Confirmar build sem erro de TypeScript.
3. No site, abrir Chat IA.
4. Enviar mensagem para AURA e ARGUS.
