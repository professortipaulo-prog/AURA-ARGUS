# AURA_ARGUS_PATCH_106 — CHAT_TO_DOCUMENT_ENGINE_BRIDGE

## Objetivo
Corrigir dois problemas reais reportados por Paulo:
1. A geração de documentos (Central de Ações) não pesquisava na internet
   quando o assunto não estava na memória/base de conhecimento.
2. Pedir "crie um documento sobre X" **no chat** nunca gerava um arquivo
   de verdade — só respondia em texto, porque o Chat e a Central de Ações
   eram dois sistemas desconectados.

## 1) Documento sem pesquisa na internet — causa e correção

**Causa:** a busca na web (PATCH_075) já estava tecnicamente disponível
em toda chamada de IA (ferramenta anexada nos dois provedores), mas a
instrução dada à IA durante a elaboração do documento (PATCH_085) só
mencionava "use o que você sabe sobre o usuário (perfil e memória)" —
nunca sugeria que pesquisar na internet era uma opção esperada. Sem essa
pista, o modelo simplesmente não pensava em usar a ferramenta para um
pedido de "escreva sobre X".

**Correção:** a instrução agora diz explicitamente: se o assunto exigir
informação factual/atual que não esteja coberta pela memória ou base de
conhecimento, usar a busca na web antes de escrever, em vez de responder
de forma genérica.

**Arquivo alterado:** `lib/actions/server.ts` (texto do `brief`)

## 2) Chat conectado à geração real de documentos

**Causa:** `/api/ai/chat` (conversa) e `executeAction`/`document.create`
(Central de Ações) nunca se comunicavam — pedir um documento no chat só
gerava uma resposta de texto, sem nenhum arquivo de verdade.

**Correção:** novo detector de intenção
(`lib/actions/chat-document-intent.ts`) reconhece frases como "crie um
documento sobre...", "gere um PDF sobre...", "faça uma planilha com...",
"prepare uma apresentação sobre...", identifica o formato pretendido
(Word, PDF, Excel, PowerPoint) e o assunto. Quando detectado, o chat
**gera o arquivo de verdade** (reaproveitando toda a lógica já validada
do PATCH_085 — elaboração por IA, memória, base de conhecimento, agora
também busca na web) e devolve um botão de download real dentro da
própria conversa.

**Testado isoladamente** com 6 frases antes de integrar — reconheceu
corretamente os 4 pedidos de documento (com formato certo cada) e
retornou `null` (não é pedido de documento) para 2 perguntas normais.

## Arquivos novos
- `lib/actions/chat-document-intent.ts`

## Arquivos alterados
- `lib/actions/server.ts` (instrução de busca na web)
- `app/api/ai/chat/route.ts` (detecção de intenção + geração real de
  documento antes do fluxo normal de conversa)
- `app/dashboard/chat/page.tsx` (novo campo `document` na mensagem;
  botão de download real na bolha de resposta)
- `app/globals.css` (`.chat-document-download`, aditivo)

## O que NÃO foi alterado
- A Central de Ações continua funcionando exatamente como antes, com
  todas as opções (persona, formato, borda, IA ligada/desligada).
- Nenhuma outra página.

## ⚠️ Limitação honesta desta primeira versão
O documento gerado pelo chat usa **configuração padrão**: persona ativa
no momento, borda variante 1 (a primeira de cada persona), sem opção de
escolher a segunda variante de borda direto pelo chat. Se você quiser
controle total sobre qual das 2 bordas usar, ainda precisa ir na Central
de Ações. Isso é uma simplificação deliberada para a primeira versão —
dá para adicionar escolha de variante pelo chat depois, se fizer falta.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat (9.39 kB → 9.47 kB)
```
`detectDocumentIntent` testada isoladamente com 6 frases reais antes de
conectar ao chat.

## ⚠️ Nota sobre a busca na web
Não tenho como testar a chamada real de busca aqui (mesma limitação de
sempre, sem chave de API neste ambiente) — a mudança foi só na instrução
de texto dada à IA, a capacidade técnica (ferramenta de busca) já estava
lá desde o PATCH_075 e você mesmo já confirmou funcionando no chat
normal.

## Teste funcional recomendado
1. Subir os 4 arquivos.
2. No Chat IA, escrever: "Crie um documento sobre [algum assunto atual
   que a IA provavelmente não saiba de cabeça]".
3. Confirmar que aparece um botão de download real na resposta, e que o
   arquivo baixado tem conteúdo relevante e atualizado (sinal de que
   pesquisou na web).
4. Testar também com "gere um PDF sobre...", "faça uma planilha com...",
   "prepare uma apresentação sobre..." e confirmar que cada um gera o
   formato certo.

## Status
Implementado e validado por build + teste isolado de detecção de
intenção. Teste real de ponta a ponta (chat → arquivo baixado)
recomendado para fechar com certeza total.
