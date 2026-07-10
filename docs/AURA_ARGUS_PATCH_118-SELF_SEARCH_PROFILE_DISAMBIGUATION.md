# AURA_ARGUS_PATCH_118 — SELF_SEARCH_PROFILE_DISAMBIGUATION

## Objetivo
Corrigir um ponto real levantado por Paulo: se a IA já sabe o perfil
completo do usuário (profissão, empresa, área de atuação), ela deveria
usar isso para diferenciar buscas sobre a própria pessoa de homônimos —
em vez de simplesmente relatar "não encontrei nada" quando os resultados
trazem outra pessoa com o mesmo nome (no caso, um lutador de MMA também
chamado Paulo Filho).

## Diagnóstico
O contexto de identidade/perfil (profissão, empresa, instituição) já
era enviado para a IA em toda conversa (via `buildPersonaSystemPrompt`)
— a informação já estava disponível. O problema era de **instrução**: a
IA nunca foi orientada explicitamente a *usar* esse perfil conhecido
para refinar buscas sobre o próprio usuário ou para descartar resultados
de pessoas homônimas incompatíveis com esse perfil.

## Correção aplicada
Nova regra adicionada ao `priorityRule` (`lib/memory/server.ts`, usada
em toda conversa real): instrui a IA a usar ativamente o perfil já
conhecido do usuário (profissão, instituição, cidade) para:
1. Refinar a própria consulta de busca (incluir esses termos).
2. Filtrar/descartar resultados de homônimos que não batem com o perfil.
3. Nunca concluir "não encontrei nada sobre você" sem cruzar os
   resultados com o que já se sabe do usuário.

## Arquivo alterado
- `lib/memory/server.ts`

## O que NÃO foi alterado
- Nenhuma lógica de busca em si (PATCH_075/117) — isso é só uma
  instrução adicional de como interpretar/refinar os resultados.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test          # 19 testes, todos passando
npm run build          # build completo
```

## ⚠️ Limitação honesta
Isto é ajuste de instrução, não código determinístico — orienta a IA a
se comportar assim, mas não garante 100%. Além disso, mesmo com essa
melhoria, se a presença online real do usuário for pequena (poucas
menções na internet com esse nome), a busca pode legitimamente não
encontrar nada relevante — isso não seria mais um problema de
desambiguação, e sim de a informação simplesmente não estar disponível
publicamente.

## Teste funcional recomendado
1. Subir o arquivo.
2. Repetir a mesma pergunta de antes ("existe alguma entrevista comigo,
   Paulo da Silva Filho ou Paulo Filho?") e confirmar se a resposta
   agora menciona ativamente ter usado o perfil (profissão/instituição)
   para diferenciar dos resultados do lutador de MMA, em vez de só
   listar os resultados desencontrados.

## Status
Implementado e validado por build/testes. Comportamento de IA — depende
de teste real para confirmação de efetividade.
