# AURA_ARGUS_PATCH_116 — AGENTS_ASK_BEFORE_WEB_SEARCH

## Objetivo
Mudar o comportamento da busca na web: em vez de pesquisar
silenciosamente (como estava desde o PATCH_075), AURA e ARGUS agora
devem **perguntar ao usuário** se ele quer que busquem na internet,
antes de efetivamente pesquisar.

## ⚠️ Isso é uma reversão de comportamento — registrado com clareza
Desde o PATCH_075, a busca na web era automática e silenciosa (a IA
decidia sozinha quando pesquisar). Este patch muda esse comportamento
por pedido direto de Paulo: agora a IA deve pedir confirmação antes.

Exceção mantida: se o próprio usuário já pedir explicitamente para
"pesquisar"/"buscar na internet" na mensagem atual, a IA pode pesquisar
direto, sem precisar perguntar de novo (perguntar seria redundante nesse
caso).

## O que foi alterado
`lib/memory/server.ts` (`priorityRule`, o mesmo bloco de instrução geral
usado em toda conversa real): nova "REGRA DE BUSCA NA WEB", instruindo a
IA a perguntar antes de usar a ferramenta de busca, explicando
brevemente por que a busca ajudaria.

## Arquivo alterado
- `lib/memory/server.ts`

## O que NÃO foi alterado
- A geração de documentos (PATCH_085/106) continua pesquisando
  automaticamente quando necessário, sem perguntar — é uma tarefa de
  geração em lote (não uma conversa de ida e volta), onde parar pra
  perguntar não faz sentido do mesmo jeito. Se quiser esse mesmo
  comportamento nos documentos também, me avise que ajusto.
- Nenhuma outra lógica.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test          # 19 testes, todos passando
npm run build          # build completo
```

## ⚠️ Limitação honesta — ajuste de instrução, não garantia de código
Como outros ajustes de prompt desta sessão (PATCH_092, 107): isto
orienta o comportamento da IA, não é uma regra de código que sempre
executa igual. Só o teste real confirma se o modelo está seguindo essa
instrução de forma consistente.

## Teste funcional recomendado
1. Subir o arquivo.
2. Perguntar no chat algo que exija informação atual/desconhecida (ex:
   "qual a cotação do dólar hoje?") sem pedir explicitamente pra
   pesquisar — confirmar que a IA pergunta antes de buscar, em vez de já
   trazer a resposta direto.
3. Responder "sim, pode buscar" e confirmar que ela pesquisa e responde
   normalmente depois disso.
4. Testar também pedindo explicitamente ("pesquise na internet sobre
   X") — confirmar que, nesse caso, ela busca direto sem perguntar de
   novo.

## Status
Implementado e validado por build/testes. Comportamento de IA — depende
de teste real para confirmação de consistência.
