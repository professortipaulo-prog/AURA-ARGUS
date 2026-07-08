# AURA_ARGUS_PATCH_075 — TEMPORAL_FIX_WEB_SEARCH_AND_ANIMATED_AVATAR

## Objetivo
Três itens pedidos por Paulo na mesma mensagem, tratados como patches
distintos dentro do mesmo pacote por serem pequenos e não conflitarem:

1. **Bug real corrigido:** a IA nunca recebia o contexto de horário/data
   nas conversas reais — só existia no endpoint de debug.
2. **Busca na web real**, usando as chaves de API que já existem (sem
   OAuth novo, sem credencial nova).
3. **Avatar animado** durante fala e escuta, usando os estados que os
   patches de voz (071-074) já expõem.

---

## 1) Bug do horário — causa raiz e correção

**Causa raiz confirmada:** `buildMemoryPrompt()` (usada de verdade em
`/api/ai/chat`) nunca incluía o bloco `CONTEXTO TEMPORAL OBRIGATÓRIO`.
Esse bloco só era montado manualmente dentro de `getMemoryDebug()`, usado
exclusivamente por `/api/memory/debug` — por isso o debug sempre mostrava
a data/hora corretas, mas a conversa real com a IA, não.

**Correção:** `buildMemoryPrompt()` agora monta o bloco temporal
internamente (via `temporalPromptBlock()`, já existente) e o inclui no
início de TODO retorno da função — inclusive no caminho "ainda sem
registros salvos". Isso corrige o bug para qualquer chamador atual ou
futuro, não só para a rota de chat. `getMemoryDebug()` foi simplificado
para não duplicar o bloco (antes ele mesmo já prependia manualmente).

**Arquivo alterado:** `lib/memory/server.ts`

## 2) Busca na web real

Ambos os provedores já usam suas próprias chaves de API existentes — a
busca é executada pelo servidor da Anthropic/Google, não por um serviço de
busca separado, então não precisou de nenhuma credencial nova:

- **Anthropic (AURA):** adicionado `tools: [{ type: 'web_search_20250305',
  name: 'web_search' }]` na chamada `messages.create`. Como a resposta pode
  vir com múltiplos blocos de texto intercalados com blocos de busca, a
  extração do texto final foi reescrita para concatenar todos os blocos de
  texto na ordem (antes, pegava só o primeiro bloco — o que cortaria a
  resposta quando há busca).
- **Gemini (ARGUS):** adicionado `tools: [{ googleSearch: {} }]` (Google
  Search grounding nativo) na chamada `getGenerativeModel`.

**Arquivos alterados:** `lib/ai/providers/anthropic.ts`,
`lib/ai/providers/gemini.ts`

### ⚠️ Limitação honesta — não testado ao vivo
Não tenho `ANTHROPIC_API_KEY` nem `GOOGLE_GENERATIVE_AI_API_KEY` reais
neste ambiente, então **não consegui validar em produção se a busca de
fato acontece** — só confirmei que o código compila (`typecheck`/`build`
limpos) e que a sintaxe da chamada corresponde à documentação pública das
APIs. O SDK da Anthropic instalado (`@anthropic-ai/sdk@0.27.3`) é de uma
época anterior ao lançamento desse recurso (por isso o cast de tipo
`as unknown as Anthropic.Tool`); a chamada deve funcionar (o SDK só repassa
o JSON), mas se não funcionar ao testar, o próximo passo é atualizar o SDK
para uma versão mais recente (`0.110.0` disponível hoje) — não fiz essa
atualização agora porque é uma mudança maior, que merece seu próprio ciclo
de teste, e não queria arriscar quebrar as chamadas que já funcionam.

**Teste necessário:** mandar uma pergunta que só pode ser respondida com
informação atual (ex: "qual a cotação do dólar hoje?" ou "quem ganhou o
jogo de ontem?") para AURA e para ARGUS, e confirmar se a resposta reflete
informação real e atual, não uma resposta genérica ou desatualizada.

## 3) Avatar animado (fala e escuta)

`AvatarDockCard` agora recebe um `voiceState: 'idle' | 'listening' |
'speaking'`, calculado a partir dos estados que os patches de voz já
mantêm (`speakingIndex`, `isListening`):

- **Falando:** o avatar pulsa mais rápido e ganha anéis de voz expansivos
  ao redor da foto (efeito "equalizador" simplificado).
- **Ouvindo:** um ponto vermelho piscando aparece no canto do avatar
  (indicador de microfone ativo).
- **Parado:** volta ao "respirar" suave que já existia.

O rótulo de status embaixo do nome também muda ("Falando" / "Ouvindo" /
"Ativo" / "Em espera") de acordo com o estado.

**Arquivos alterados:** `app/dashboard/chat/page.tsx` (componente
`AvatarDockCard` e os dois pontos onde ele é usado), `app/globals.css`
(regras novas, nenhuma existente foi alterada).

## O que NÃO foi alterado
- Nenhuma outra página, nenhum outro componente.
- A lógica de memória de preferências, Action Engine, Identity Engine.
- Nenhuma dependência nova instalada (SDKs continuam nas versões atuais).

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat (8.46 kB → 8.62 kB)
```

## Pendência registrada — conectar serviços externos (Drive, Gmail etc.)
Continua fora do escopo deste patch: exige Paulo criar um projeto no
Google Cloud Console, configurar tela de consentimento OAuth e registrar o
redirect URI de produção. Nenhuma decisão de infraestrutura foi tomada por
conta própria.

## Status
Bug do horário: corrigido com confiança alta (causa raiz clara,
comprovada). Busca na web: implementada, mas precisa de teste ao vivo com
chave real antes de considerar concluída. Avatar animado: implementado e
validado (build), teste visual recomendado no navegador.
