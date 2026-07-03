# PATCH 014 — AI Provider Manager Real

Este patch substitui a seleção manual de modelos por descoberta automática.

## Implementado

- `GET /api/ai/models`
  - Lista modelos disponíveis na Anthropic via `GET /v1/models`.
  - Lista modelos disponíveis no Gemini via `v1beta/models`.
  - Não expõe chaves de API.

- AI Router
  - Aceita `DEFAULT_AI_MODEL=auto`.
  - Aceita `GEMINI_DEFAULT_MODEL=auto`.
  - Resolve automaticamente um modelo compatível.
  - Faz fallback para o outro provedor se o provedor primário falhar.

- Chat
  - Não usa mais `claude-3-5-sonnet-latest` nem `gemini-1.5-pro` como fallback fixo.
  - Erros de modelo antigo ficam amigáveis.

## Variáveis recomendadas na Vercel

```env
DEFAULT_AI_PROVIDER=anthropic
DEFAULT_AI_MODEL=auto
GEMINI_DEFAULT_MODEL=auto
ANTHROPIC_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Testes

- `npm run build` passou.
- `GET /api/ai/status` deve mostrar `resolvedModel` e `modelCount`.
- `GET /api/ai/models` deve mostrar os modelos da conta.
