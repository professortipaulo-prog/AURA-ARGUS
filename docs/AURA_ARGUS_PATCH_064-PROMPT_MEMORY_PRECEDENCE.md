# AURA_ARGUS_PATCH_064 - PROMPT_MEMORY_PRECEDENCE

## Objetivo
Corrigir a falha em que AURA confirmava um fato recente, mas na pergunta seguinte dizia que não havia registro.

## Causa provável
O bloco de memória local/da sessão era enviado como instrução extra com baixa prioridade no prompt final. O modelo podia priorizar o bloco de memória persistente incompleto e ignorar a memória recém-capturada pelo chat.

## Alteração
- Reorganiza o prompt final em `lib/identity/prompt-builder.ts`.
- Coloca a memória da sessão atual antes da memória persistente do servidor.
- Adiciona regra explícita de precedência: fatos confirmados na sessão atual devem ser tratados como fonte de verdade.

## Arquivos alterados
- `lib/identity/prompt-builder.ts`

## Não altera
- CSS
- Chat visual
- Memória visual
- Login
- Register
- Landing
- Supabase schema

## Teste direto no site
1. Abrir Chat IA com AURA.
2. Enviar: `Gosto de azul.`
3. Perguntar: `Qual minha cor favorita?`
4. Resultado esperado: AURA deve responder `Azul.`

## Critério de aceite
AURA e ARGUS devem usar fatos recém-registrados no chat mesmo quando a memória persistente do servidor ainda não trouxe esse fato no contexto.
