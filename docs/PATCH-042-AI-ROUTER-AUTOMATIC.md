# PATCH 042 — AI Router Automático

## Objetivo

Ativar uma camada de roteamento real entre Anthropic e Google Gemini sem alterar a interface aprovada.

## O que mudou

- AURA passa a preferir Anthropic automaticamente.
- ARGUS passa a preferir Gemini automaticamente.
- O chat não precisa mais enviar provedor fixo no front-end.
- O router classifica mensagem por tipo de tarefa e complexidade.
- O router registra motivo da decisão.
- Fallback continua ativo: se o provedor principal falhar, tenta o secundário configurado.
- Nova rota de diagnóstico: `/api/ai/router`.

## Arquivos alterados

```txt
app/api/ai/chat/route.ts
app/api/ai/router/route.ts
app/dashboard/chat/page.tsx
lib/ai/ai-router.ts
lib/ai/router-policy.ts
lib/ai/types.ts
```

## Como testar

1. Abra `/api/ai/router`.
   - Deve retornar política, status dos provedores e inventário de modelos.

2. Teste preview de decisão:

```txt
/api/ai/router?persona=aura&message=crie%20um%20texto%20estratégico
```

Esperado: `provider: anthropic`.

3. Teste ARGUS:

```txt
/api/ai/router?persona=argus&message=analise%20este%20erro%20no%20supabase
```

Esperado: `provider: gemini`.

4. No chat:
   - Selecione AURA e envie: `aura, me ajude a organizar um documento`.
   - Selecione ARGUS e envie: `argus, analise um erro de deploy`.

5. Verifique no rodapé da resposta o provedor/modelo usado.

## Observação

Não há migração SQL neste patch.
