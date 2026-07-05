# AURA_ARGUS_PATCH_055-CONTEXT_BUILDER_UNIFIED

## Objetivo
Corrigir a diferença de contexto entre AURA e ARGUS no Chat IA, garantindo que fatos confirmados pelo usuário sejam capturados, enviados ao prompt imediatamente e usados pelas duas personas.

## Problema corrigido
AURA estava recuperando apenas parte da memória local. Em testes, ARGUS reconhecia Supabase, Vercel e Next.js 14, enquanto AURA dizia que deploy e framework estavam sem registro.

## Alterações realizadas
- Ampliada a extração de fatos locais no chat.
- Captura agora reconhece frases como:
  - Meu banco principal é Supabase.
  - Meu deploy é na Vercel.
  - Meu framework é Next.js 14.
  - Minha IA estratégica utiliza Claude.
  - Minha IA operacional utiliza Gemini.
  - Meu projeto chama-se AURA/ARGUS AI Operating System.
  - O objetivo principal é criar um sistema operacional de IA.
- Corrigido envio imediato da memória recém-extraída no mesmo prompt.
- Reforçada regra do prompt para AURA e ARGUS usarem fatos confirmados antes de inferências.
- Reduzida tendência da AURA de dizer “sem registro” quando o fato já existe na memória local.

## Arquivo alterado
- app/dashboard/chat/page.tsx

## Não alterado
- Landing Page visual.
- CSS global.
- Animação de processamento.
- AI Router.
- API de chat.
- Banco Supabase.

## Teste funcional direto no site
1. Abrir Chat IA.
2. Enviar para ARGUS ou AURA:

```text
Meu banco principal é Supabase.
Meu deploy é na Vercel.
Meu framework é Next.js 14.
Minha IA estratégica utiliza Claude.
Minha IA operacional utiliza Gemini.
```

3. Alternar para AURA.
4. Perguntar:

```text
Resuma toda a arquitetura do projeto.
```

## Resultado esperado
AURA deve mencionar:
- Supabase.
- Vercel.
- Next.js 14.
- Claude como IA estratégica.
- Gemini como IA operacional.

AURA não deve dizer que frontend, deploy ou framework estão sem registro quando esses fatos foram informados antes.

## Validação técnica
Executado:

```text
npx tsc --noEmit
```

Resultado:

```text
TSC_STATUS=0
```

## Status
Pronto para aplicação.
