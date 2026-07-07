# AURA_ARGUS_PATCH_066 — COLOR_PREFERENCE_REGEX_ANCHOR_FIX

## Objetivo
Corrigir a causa raiz (não apenas o sintoma) da falha em que "Gosto de azul." era
registrado como "Anotado", mas não era recuperado ao perguntar "Qual minha cor
favorita?". Esta falha é a mesma reportada e supostamente corrigida no
PATCH_065, mas o teste funcional daquele patch usou a frase sem ponto final
("Gosto de azul"), o que mascarou o bug real.

## Causa raiz (diagnóstico)
Em `lib/memory/server.ts` (server-side) e `app/dashboard/chat/page.tsx`
(client-side), as regexes que extraem a cor favorita/preferida usavam:

```
([a-zA-ZÀ-ÿ\s-]{3,40})$
```

A classe de caracteres não inclui pontuação, e o `$` exige que o grupo
capturado termine exatamente no fim da string. Qualquer mensagem real do
usuário terminando com `.`, `!` ou `?` (o caso normal de digitação) fazia a
regex inteira falhar, sem lançar erro — o candidato de memória simplesmente
não era gerado, e o card "Anotado" no chat era apenas confirmação de UI, não
confirmação de persistência real.

Comprovação isolada (Node):
```
"Gosto de azul."  -> null   (regex antiga)
"Gosto de azul"   -> "azul" (regex antiga)
```

## Correção aplicada
Tornado o grupo de captura não-guloso (`{3,40}?`) e adicionado um sufixo
opcional de pontuação antes do `$` (`[.!?]*$`), nas três variantes de regex de
cor favorita, tanto no servidor quanto no cliente:

```
([a-zA-ZÀ-ÿ\s-]{3,40}?)[.!?]*$
```

## Arquivos alterados
- `lib/memory/server.ts` — 3 regexes de `colorPreference` (extração server-side
  persistida no Supabase, usada pelo Memory Engine entre sessões).
- `app/dashboard/chat/page.tsx` — 1 regex de `corFavorita` (extração
  client-side, usada para resposta imediata na mesma sessão).

## O que NÃO foi alterado
- CSS global, layout, landing, login, register.
- Qualquer outro padrão de extração (banco, deploy, framework, editor,
  decisão, próxima etapa) — nenhum deles tinha esse bug, pois todos usam
  `(.+)$` (que já aceita qualquer caractere, inclusive pontuação final) em vez
  da classe restrita usada apenas nos padrões de cor.
- Lógica de priorização de memória, Context Builder, Prompt Builder.
- Schema do Supabase / migrações.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build        # build de produção completo, 35 rotas, sem erros
```
Teste isolado da regex (Node) confirmando captura correta com e sem pontuação
final (`.`, `!`), e nenhuma mudança de comportamento para os demais padrões.

## Teste funcional recomendado no site
1. Abrir Chat IA.
2. Enviar: `Gosto de azul.` (com o ponto final, como se digita normalmente).
3. Perguntar: `Qual minha cor favorita?`

## Resultado esperado
AURA ou ARGUS deve responder algo equivalente a:
`Sua cor favorita/preferida é azul.`

## Status
Patch corretivo de causa raiz. Resolve a pendência técnica registrada no
Documento Mestre de Continuidade Técnica (06/07/2026) sobre preferências
pessoais não retornarem.
