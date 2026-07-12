# AURA_ARGUS_PATCH_123 — QUIZ_AND_WORDSEARCH_FIX

## Objetivo
Corrigir o bug reportado por Paulo: só a Forca funcionava na Central de
Estudos — Jogo do Milhão e Caça-palavras não. Diagnosticado por leitura
cuidadosa de código (sem acesso a logs reais), com 2 causas raiz
diferentes, uma para cada jogo.

## Causa raiz 1 — Jogo do Milhão: resposta cortada no meio
`lib/ai/providers/anthropic.ts` tinha `max_tokens: 1500` fixo para
**toda** chamada de IA (chat, documentos, jogos). Um quiz de 10
perguntas, cada uma com 4 opções, é uma resposta grande — bem maior que
1500 tokens quando estruturada em JSON. A resposta provavelmente estava
sendo cortada no meio pela Anthropic, quebrando o JSON antes mesmo de
chegar no meu código de extração.

**Correção**: `max_tokens` elevado de 1500 para 4096. Esse limite vale
para toda chamada da AURA (Anthropic) — beneficia não só o quiz, mas
também documentos mais longos, que podem ter sofrido do mesmo problema
sem ter sido notado ainda.

## Causa raiz 2 — Caça-palavras: grade pequena demais para frases
Meu algoritmo (PATCH_122) pedia à IA "uma palavra, sem espaço" — mas
IAs frequentemente ignoram esse tipo de instrução e devolvem frases
("Sistema Operacional" em vez de uma palavra só). Minha normalização
removia os espaços por completo, transformando a frase em uma palavra
gigante ("SISTEMAOPERACIONAL", 18 letras) — que não cabia na grade de
15x15 que eu tinha construído, e era descartada. Se isso acontecesse com
a maioria das palavras sugeridas, o jogo ficava sem nenhuma palavra
posicionável, e a geração falhava por completo.

**Correção**: grade aumentada de 15x15 para 20x20 — testado com uma
simulação realista de frases (incluindo "Inconfidência Mineira", que
vira 20 letras já no limite) antes de aplicar no código de verdade, e
confirmado que todas as 14 palavras/frases testadas couberam.

## Testes de regressão adicionados
`lib/study/wordsearch.test.ts` ganhou um teste específico simulando o
cenário exato do bug (a IA devolvendo frases com espaço em vez de
palavras únicas) — para travar esse problema não voltar a acontecer.

## Arquivos alterados
- `lib/ai/providers/anthropic.ts` (`max_tokens`: 1500 → 4096)
- `lib/study/generation.ts` (grade padrão do caça-palavras: 15 → 20)
- `lib/study/wordsearch.test.ts` (novo teste de regressão)

## O que NÃO foi alterado
- Forca — já funcionava, sem alteração.
- A lógica de interação dos jogos (clicar/arrastar, teclado) — inalterada.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 28 testes, todos passando (1 novo)
npm run build           # build completo
```

## ⚠️ Limitação honesta
Diagnostiquei isso por leitura cuidadosa de código, sem acesso a logs
reais do erro que você viu — é a explicação mais provável com base em
como o sistema é construído, testada matematicamente (limite de tokens,
simulação do algoritmo da grade), mas não é 100% confirmada até você
testar de novo. Se ainda falhar depois deste patch, um print da tela de
erro (ou o texto exato que aparece) me ajudaria a fechar com certeza.

## Teste funcional recomendado
1. Subir os 2 arquivos de código.
2. Central de Estudos → mesmo assunto que falhou antes → 🎮 Gamificação
   → Jogo do Milhão. Confirmar que gera as 10 perguntas normalmente.
3. Testar Caça-palavras com o mesmo assunto — confirmar que aparecem
   várias palavras na lista, não zero.
4. Se algum dos dois ainda falhar, me mandar a mensagem de erro exata
   que aparece na tela.

## Status
Implementado e validado por build/testes automatizados (incluindo
simulação do cenário exato do bug). Depende de teste ao vivo para
confirmação final, já que a causa raiz foi diagnosticada sem acesso a
logs reais do erro original.
