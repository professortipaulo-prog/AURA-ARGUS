# AURA_ARGUS_PATCH_108 — CHAT_ASK_BORDER_BEFORE_DOCX

## Objetivo
Quando o usuário pede um documento Word (.docx) pelo chat, o sistema
agora **pergunta qual borda usar antes de criar** — e só gera o arquivo
depois que a pessoa responde, usando a borda escolhida.

## Por que isso precisou de mais do que só uma pergunta
O chat trata cada mensagem de forma isolada (uma chamada de API por
mensagem, sem "memória de curto prazo" automática de uma pergunta em
aberto). Para o fluxo "pergunta → aguarda resposta → aí sim cria"
funcionar de verdade, foi necessário guardar o pedido pendente entre uma
mensagem e a próxima.

## Como funciona agora

1. Usuário pede um documento Word: **"crie um documento sobre X"**.
2. Se a mensagem **já** especificar a borda (ex: "crie um documento sobre
   X com a borda floral"), gera direto, sem perguntar.
3. Se **não** especificar, o sistema guarda o pedido (assunto, título,
   formato) vinculado ao usuário e à persona ativa, e pergunta:
   *"Antes de gerar o documento sobre 'X', qual borda você quer usar?
   1) Ondas azuis ou 2) Floral azul? É só responder com o nome ou o
   número."* (no caso da AURA; ARGUS pergunta Circuito/Hexagonal).
4. Na próxima mensagem, se a pessoa responder com o nome da borda ou só
   o número (1 ou 2), o sistema recupera o pedido pendente e gera o
   documento com a borda escolhida.
5. **O pedido pendente expira em 15 minutos** — evita que uma resposta
   solta, dias depois, dispare a criação de um documento antigo já
   esquecido.
6. Formatos sem borda (.xlsx, .pptx, .pdf) continuam gerando direto, sem
   pergunta — borda só existe para Word.

## Arquivos novos
- `supabase/migrations/0015_chat_pending_document.sql` (tabela
  `core.chat_pending_document`, uma linha por usuário+persona)
- `lib/actions/chat-border-choice.ts` (nomes das bordas, detecção da
  escolha na mensagem, salvar/buscar/limpar pedido pendente)

## Arquivos alterados
- `app/api/ai/chat/route.ts` (fluxo completo: checa pendência → pergunta
  ou gera, conforme o caso)

## O que NÃO foi alterado
- A geração de documentos em si, a Central de Ações, o histórico de
  downloads (PATCH_106) — tudo reaproveitado sem alteração.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros (1 erro de declaracao perdida durante a
                       edicao, corrigido e revalidado)
npm run build         # build completo
```
`detectBorderChoiceInMessage` testada isoladamente com 6 casos reais
(nomes das 4 bordas, resposta só com número, e mensagem sem relação) —
todos corretos.

## Passo extra necessário — nova migração no Supabase
Rodar `supabase/migrations/0015_chat_pending_document.sql` no SQL Editor
antes de testar.

## Teste funcional recomendado
1. Aplicar a migração.
2. Subir os 2 arquivos.
3. No chat, com AURA ativa: "crie um documento sobre educação
   financeira" — confirmar que a IA pergunta qual borda (Ondas azuis ou
   Floral azul), sem gerar nada ainda.
4. Responder só "floral" — confirmar que agora sim gera o documento, com
   a borda floral, e aparece o botão de download.
5. Repetir com ARGUS, respondendo "hexagonal".
6. Testar também pedindo direto com a borda já especificada na mesma
   frase (ex: "crie um documento sobre X com a borda circuito" para
   ARGUS) — confirmar que gera direto, sem perguntar.

## Status
Implementado e validado por build + teste isolado da detecção de
resposta. Depende de aplicar a migração e testar ao vivo para
confirmação final do fluxo completo de 2 mensagens.
