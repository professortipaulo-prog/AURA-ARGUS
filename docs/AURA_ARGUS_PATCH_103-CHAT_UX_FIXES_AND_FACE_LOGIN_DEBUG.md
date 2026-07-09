# AURA_ARGUS_PATCH_103 — CHAT_UX_FIXES_AND_FACE_LOGIN_DEBUG

## Objetivo
Corrigir 3 problemas reportados por Paulo após testar os patches de
reconhecimento facial: bloqueio periódico incômodo no chat, layout do
chat não acompanhando o crescimento da conversa, e login por rosto
falhando sem explicação.

## 1) Verificação facial periódica removida do Chat

**Pedido direto de Paulo:** a verificação periódica (PATCH_099) estava
gerando falsos positivos e atrapalhando o uso normal — "acho que é
melhor retirar do chat".

**Ação:** `FaceGuard` removido do Chat IA. O componente e a lógica de
verificação continuam existindo no código (não foram apagados — só
desconectados do chat), caso Paulo queira reativar no futuro com ajustes.

**Arquivo alterado:** `app/dashboard/chat/page.tsx`

## 2) Layout do chat não acompanhava o crescimento da conversa

**Causa raiz encontrada:** a barra lateral (`.aios-sidebar`) usa
`min-height: 100vh` sem limite máximo nem rolagem própria. Com o
crescimento do menu ao longo dos patches desta sessão (item "Ações"
adicionado no PATCH_070, mais o card de perfil embaixo), o conteúdo real
da barra lateral passou a ficar mais alto que a tela em telas menores —
e como ela é um item flexível dentro do layout principal, isso empurrava
a **página inteira** a crescer e rolar, em vez de só a área de mensagens
rolar por dentro (que é o comportamento correto, com o campo de digitar
sempre fixo embaixo — como em outros chats conhecidos).

**Correção:** a barra lateral agora tem altura travada em `100vh` com
rolagem própria (`overflow-y: auto`) — ela nunca mais força a página
inteira a crescer, não importa quantos itens tenha no menu.

**Arquivo alterado:** `app/globals.css` (`.aios-sidebar`)

## 3) Login por reconhecimento facial não reconheceu o rosto

Paulo tentou entrar por reconhecimento facial e recebeu a mensagem
genérica de erro (PATCH_100 foi desenhado para nunca revelar o motivo
exato, por segurança). Sem ver o dado real, eu estaria só chutando a
causa (iluminação diferente, ângulo, ou bug real).

**Ferramenta criada, em vez de suposição:** novo endpoint
`GET /api/face/debug`, que mostra (só para o próprio usuário logado, com
sessão válida):
- Se existe cadastro facial e quando foi feito.
- As últimas 20 tentativas de verificação, com a **distância calculada**
  em cada uma e se bateu ou não.
- O limiar oficial usado (0,6) para comparação.

Com isso dá para saber, sem chutar: se a distância ficou **perto** do
limiar (ex: 0,65 — sinal de que era a mesma pessoa, só com
iluminação/ângulo ruim), ou **longe** (ex: 2,5 — sinal de problema mais
sério, como o cadastro ter sido salvo errado).

**Arquivo novo:** `app/api/face/debug/route.ts`

## Arquivos alterados/novos neste patch
- `app/dashboard/chat/page.tsx` (remoção do FaceGuard)
- `app/globals.css` (correção da barra lateral)
- `app/api/face/debug/route.ts` (novo)

## O que NÃO foi alterado
- O cadastro facial (PATCH_096/098) continua funcionando normalmente.
- O login por senha nunca foi afetado por nenhum destes patches.
- A lógica de login por rosto (PATCH_100) não foi alterada ainda — o
  passo seguinte é usar o resultado do `/api/face/debug` para decidir a
  correção certa, em vez de mudar algo às cegas.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Subir os 3 arquivos.
2. Testar o Chat IA — confirmar que não aparece mais a tela de bloqueio
   por reconhecimento facial.
3. Numa tela menor (ou redimensionando a janela do navegador), confirmar
   que a barra lateral agora tem sua própria rolagem, sem empurrar a
   página inteira.
4. Acessar, logado, `https://aura-argus.vercel.app/api/face/debug` e me
   mandar o JSON completo — com isso eu fecho o diagnóstico do login por
   rosto na próxima etapa.

## Status
2 dos 3 problemas corrigidos diretamente (chat travado, layout).
O terceiro (login por rosto) tem a ferramenta de diagnóstico pronta —
aguardando o resultado real para aplicar a correção certa.
