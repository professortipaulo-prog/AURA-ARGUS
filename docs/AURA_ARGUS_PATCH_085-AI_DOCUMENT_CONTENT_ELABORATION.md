# AURA_ARGUS_PATCH_085 — AI_DOCUMENT_CONTENT_ELABORATION

## Objetivo
Paulo notou que o campo "Conteúdo" da Central de Ações era usado
literalmente no documento gerado — se digitasse "Fale sobre minha
carreira", o arquivo saía com exatamente esse texto, sem nenhuma
elaboração. Pediu que a IA interprete o campo como um pedido/briefing e
desenvolva o conteúdo de verdade, usando o que sabe sobre o usuário.

## O que foi implementado
Antes de gerar o documento, se a opção "Desenvolver com IA" estiver
marcada (ligada por padrão) e houver algum texto no campo Conteúdo, o
Action Engine agora:

1. Busca o contexto de memória do usuário (mesma função `getMemoryContext`
   + `buildMemoryPrompt` já usada no Chat IA) — então a IA pode usar fatos
   já conhecidos (preferências, decisões, contexto de projeto) se forem
   relevantes ao pedido.
2. Monta um prompt de sistema com a persona escolhida (`buildPersonaSystemPrompt`,
   mesma função do chat — AURA ou ARGUS respondem com o tom de cada uma).
3. Chama a IA real (`sendChat`, o mesmo roteador usado no Chat IA — Anthropic
   para AURA, Gemini para ARGUS) com uma instrução clara: desenvolver o
   conteúdo completo do documento, no formato e título informados, a
   partir do que o usuário descreveu — sem saudações, sem comentários
   sobre a tarefa, só o conteúdo final.
4. O texto que a IA devolve passa a ser o conteúdo real do documento
   gerado (Word/Excel/PowerPoint/PDF/etc.), no lugar do texto literal.

Se a chamada de IA falhar por qualquer motivo (chave ausente, erro de
rede, etc.), o documento **ainda é gerado**, usando o texto literal como
já funcionava antes — só que com um aviso (`warnings`) explicando que a
IA não pôde ser usada. Nenhuma geração de documento passa a falhar por
causa dessa mudança.

## Controle do usuário
Novo checkbox na Central de Ações: **"Desenvolver o conteúdo com IA"**,
ligado por padrão. Se desligado, o texto do campo Conteúdo é usado
literalmente, como antes do patch — para quem já tem o texto pronto e só
quer transformar em arquivo, sem reescrita.

## Arquivos alterados
- `lib/actions/types.ts` (`useAI?: boolean` no request)
- `lib/actions/server.ts` (elaboração via IA antes de gerar o documento)
- `app/dashboard/actions/page.tsx` (checkbox + texto explicativo)
- `app/globals.css` (estilo novo `.aios-checkbox-control`, aditivo)

## O que NÃO foi alterado
- A geração dos arquivos em si (`.docx`/`.xlsx`/`.pptx`/`.pdf`/etc.) —
  só o texto que entra como conteúdo mudou de origem (literal → IA).
- Nenhuma outra página, nenhum outro Action.
- CSS/layout existentes — só uma classe nova.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## ⚠️ Limitação honesta — não testado ao vivo
Igual às outras funcionalidades que dependem de chamar a IA de verdade
(busca na web, patch anterior), **não tenho as chaves reais da
Anthropic/Gemini neste ambiente**, então não consegui validar a chamada
de ponta a ponta — só confirmei que compila e que a lógica de fallback
(quando a IA falha) não quebra a geração do documento.

## Teste funcional recomendado
1. Central de Ações → formato Word, persona AURA, deixar "Desenvolver com
   IA" marcado.
2. No campo Conteúdo, escrever algo como "Fale sobre minha carreira" ou
   "Resuma o projeto AURA/ARGUS".
3. Gerar e abrir o arquivo — o conteúdo deve ser um texto desenvolvido de
   verdade pela IA, não a frase literal digitada.
4. Desmarcar "Desenvolver com IA", gerar de novo com o mesmo texto, e
   confirmar que agora o conteúdo do arquivo é exatamente o que foi
   digitado, sem elaboração.

## Status
Implementado, validado por build, com fallback seguro em caso de falha da
IA. Teste ao vivo com chave real pendente de confirmação de Paulo.
