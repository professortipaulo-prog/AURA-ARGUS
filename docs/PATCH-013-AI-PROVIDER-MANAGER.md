# PATCH 013 — AI Provider Manager

## Objetivo
Eliminar modelos hardcoded/desatualizados nos provedores Anthropic e Gemini.

## O que foi implementado
- Rota `GET /api/ai/models` para listar modelos disponíveis por provedor.
- Anthropic passa a consultar `GET /v1/models` no servidor.
- Gemini passa a consultar `GET /v1beta/models` no servidor.
- `DEFAULT_AI_MODEL=auto` e `GEMINI_DEFAULT_MODEL=auto` passam a ser suportados.
- Se o modelo configurado falhar por `not found`, o sistema tenta listar e selecionar outro modelo compatível automaticamente.
- Mensagens de erro do chat foram limpas para não exibir JSON bruto de SDKs/APIs.

## Variáveis recomendadas na Vercel
```env
DEFAULT_AI_PROVIDER=anthropic
DEFAULT_AI_MODEL=auto
GEMINI_DEFAULT_MODEL=auto
```

Também manter:

```env
ANTHROPIC_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Testes recomendados
1. Acessar `/api/ai/models`.
2. Confirmar que Anthropic e/ou Gemini retornam `selectedModel`.
3. Testar chat com AURA.
4. Testar chat com ARGUS.

## Observação
Os nomes exibidos no Claude Web e no Gemini Web são nomes comerciais. A API pode usar IDs diferentes/versionados. Por isso este patch evita depender de um ID fixo.
