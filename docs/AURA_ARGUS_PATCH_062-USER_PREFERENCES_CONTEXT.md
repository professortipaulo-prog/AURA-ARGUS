# AURA_ARGUS_PATCH_062 - USER_PREFERENCES_CONTEXT

## Objetivo
Corrigir a recuperação de preferências pessoais simples no Chat IA, especialmente fatos como cor favorita/preferida, sem alterar layout, CSS global, Login, Register, Landing ou página Memória.

## Problema observado
O Memory Engine já registrava sessões, mensagens e memórias, e recuperava fatos de projeto como banco principal e próxima etapa. Porém, preferências pessoais como `gosto de azul` eram confirmadas pela IA, mas não eram recuperadas em perguntas posteriores como `qual minha cor favorita?`.

## Arquivos alterados
- `app/dashboard/chat/page.tsx`

## Alterações realizadas
- Adicionada extração local de preferência de cor a partir de frases como:
  - `Minha cor favorita é azul.`
  - `Minha cor preferida é azul.`
  - `Gosto de azul.`
  - `Prefiro azul.`
- Incluída a preferência no bloco de memória local enviado ao prompt.
- Ajustada a regra do prompt para responder perguntas sobre preferências pessoais quando o fato estiver listado na memória.
- Ajustada a pontuação de prioridade para que preferências visuais sejam consideradas, sem ficarem acima de fatos críticos do projeto.

## Não alterado
- CSS.
- Layout do Chat.
- Layout da Memória.
- Animação do Chat.
- Login/Register.
- Landing Page.
- APIs.

## Teste funcional
No Chat IA, enviar:

```text
Gosto de azul.
```

Depois perguntar:

```text
Qual minha cor favorita?
```

Resultado esperado:

```text
Sua cor favorita/preferida é azul.
```

## Critérios de aceite
- AURA responde corretamente a preferência de cor.
- ARGUS responde corretamente a preferência de cor.
- Próxima etapa e banco principal continuam sendo priorizados quando perguntados.
- Nenhuma alteração visual ocorre.
