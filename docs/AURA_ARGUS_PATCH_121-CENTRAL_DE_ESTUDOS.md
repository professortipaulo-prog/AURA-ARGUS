# AURA_ARGUS_PATCH_121 — CENTRAL_DE_ESTUDOS

## Objetivo
Construir a base do nível "Estudantil" pedido por Paulo: uma Central de
Estudos com **Botão de Foco** (resumo estilo NotebookLM) e **Botão de
Gamificação** (jogos educativos gerados sobre o assunto que o aluno está
estudando) — pensando no beta de 10 dias com 10 alunos.

## Escopo desta entrega — 2 de 4 jogos, por decisão consciente
Paulo pediu 4 jogos: Jogo do Milhão, Forca, Caça-palavras e Palavras
Cruzadas. Entreguei **Jogo do Milhão e Forca completos e jogáveis** —
Caça-palavras e Palavras Cruzadas exigem um algoritmo de posicionamento
de palavras numa grade (encontrar onde cada palavra cabe sem
sobreposição inválida), que é uma peça de complexidade bem maior.
Prefiro entregar 2 jogos que funcionam de verdade agora, a 4 pela
metade — os outros dois ficam registrados como próxima etapa.

## O que foi implementado

### Geração de conteúdo via IA (`lib/study/generation.ts`)
- `generateStudySummary()`: resumo de estudo organizado (títulos,
  tópicos, destaques, seção final "Perguntas para revisar") — usa a
  Base de Conhecimento do aluno (se ele já subiu material sobre o
  assunto) como fonte prioritária, igual ao resto do sistema.
- `generateQuiz()`: 10 perguntas de múltipla escolha estilo "Show do
  Milhão", dificuldade e prêmio crescentes.
- `generateHangman()`: 5 palavras/expressões com dicas, para o jogo da
  forca.
- `extractJson()`: extrai o JSON da resposta da IA mesmo quando ela
  ignora a instrução e embrulha em markdown ou adiciona texto solto —
  **testado isoladamente com 4 casos reais** (JSON puro, com crases, com
  texto extra, e inválido) antes de considerar pronto. Também virou
  teste automatizado (`lib/study/generation.test.ts`, 4 testes).

### Jogos jogáveis de verdade (não só geração de conteúdo)
- `components/study/quiz-game.tsx`: Jogo do Milhão completo — pergunta
  atual, prêmio acumulado, revela certo/errado, encerra ao errar ou ao
  completar as 10.
- `components/study/hangman-game.tsx`: Forca completa — teclado
  clicável, contorno de erros (máximo 6), dica, pontuação, várias
  palavras em sequência.

### Página nova
`/dashboard/estudos` — Central de Estudos:
1. Campo "o que você está estudando agora" (matéria + tópico).
2. Escolha da persona (AURA/ARGUS).
3. Botão 🎯 Foco → gera e mostra o resumo.
4. Botão 🎮 Gamificação → escolhe entre Jogo do Milhão / Forca, gera e
   já entra jogando.
5. Adicionado "Central de Estudos" ao menu lateral.

### Upload de material
Não precisou construir nada novo aqui — a Central de Estudos já usa a
Base de Conhecimento (PATCH_086/111) que já existe. O aluno sobe o
material em Documentos, e tanto o resumo quanto os jogos usam esse
conteúdo automaticamente quando relevante ao assunto digitado.

## Arquivos novos
- `lib/study/generation.ts`
- `lib/study/generation.test.ts`
- `app/api/study/summary/route.ts`
- `app/api/study/quiz/route.ts`
- `app/api/study/hangman/route.ts`
- `components/study/quiz-game.tsx`
- `components/study/hangman-game.tsx`
- `app/dashboard/estudos/page.tsx`

## Arquivos alterados
- `components/layout/sidebar.tsx` (novo item de menu)
- `app/globals.css` (estilos dos jogos, aditivo)

## O que NÃO foi alterado
- Nenhuma lógica de conhecimento/documentos existente — só consultada.
- Nenhuma outra página.
- Ainda não há diferenciação por plano (Estudantil/Worker/Plus) — essa
  página está acessível a qualquer conta por enquanto, já que o controle
  de acesso por nível ainda não foi implementado (aguardando você
  confirmar a tabela de recursos por plano que propus).

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 23 testes, todos passando (4 novos)
npm run build           # build completo — /dashboard/estudos (2.97 kB)
                          e as 3 rotas novas compilaram
```

## ⚠️ Limitações honestas
1. **Não testei a geração real com a IA neste ambiente** (sem chave
   real). A extração de JSON foi testada isoladamente e à prova de
   variações comuns de resposta, mas a qualidade real do conteúdo
   gerado (perguntas boas, palavras bem escolhidas) só o teste ao vivo
   confirma.
2. **Palavras com espaço no jogo da forca**: preferi permitir expressões
   de até 3 palavras na instrução à IA, mas o jogo em si trata espaços
   como já "revelados" — funciona, mas fica mais fácil quando a
   expressão tem várias palavras curtas.
3. Caça-palavras e palavras cruzadas ainda não existem — mensagem
   "chegam em breve" já aparece na tela, para não prometer o que não
   está pronto.

## Teste funcional recomendado
1. Subir todos os arquivos.
2. Ir em Central de Estudos, digitar "História — Inconfidência Mineira".
3. Clicar 🎯 Foco e conferir se o resumo veio organizado e relevante.
4. Clicar 🎮 Gamificação → Jogo do Milhão, jogar até errar ou terminar.
5. Repetir com Forca.
6. Testar também subindo um PDF/Word sobre um assunto específico em
   Documentos antes, e conferir se o resumo/jogos usam esse material
   real (não só conhecimento geral da IA).

## Status
Implementado e validado por build/testes automatizados. Geração real via
IA não testada neste ambiente — depende de teste ao vivo antes do beta
com os 10 alunos.
