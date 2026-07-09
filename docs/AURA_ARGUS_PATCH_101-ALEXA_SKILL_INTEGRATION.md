# AURA_ARGUS_PATCH_101 — ALEXA_SKILL_INTEGRATION

## Objetivo
Conectar AURA/ARGUS à Alexa, permitindo perguntar em voz alta pela
Amazon Echo (ou qualquer dispositivo Alexa) e receber resposta das
personas, usando a memória e a base de conhecimento reais do sistema.

## Escopo confirmado com Paulo antes de implementar
Versão simples para começar: **skill fixa para uma única conta**
(configurada via variável de ambiente), sem vinculação de conta (OAuth)
por usuário — decisão explícita para não construir uma camada de
autenticação multi-usuário que ainda não é necessária.

## O que só Paulo precisa fazer (fora do meu alcance)
Este patch é o espelho do que já aconteceu com Google Drive/Gmail — a
Amazon exige uma conta e configuração próprias que só o dono pode fazer:

1. Criar uma **conta de desenvolvedor Amazon** (gratuita) em
   developer.amazon.com.
2. No **Alexa Developer Console**, criar uma skill nova:
   - Nome: o que preferir (ex: "AURA ARGUS").
   - Modelo: **Custom**.
   - Hospedagem: **"Provision your own backend resources"** (não usar
     Alexa-hosted/Lambda — vamos usar o próprio site como backend).
3. Na aba **Build → Interaction Model → JSON Editor**, colar o conteúdo
   de `docs/alexa-interaction-model.json` (entregue neste patch) — já
   define as frases que ativam a skill.
4. Na aba **Endpoint**, escolher **HTTPS** e informar:
   `https://aura-argus.vercel.app/api/alexa`
   (usar um certificado SSL de domínio confiável — o da Vercel já serve).
5. Copiar o **Skill ID** (aparece no topo da página da skill) e configurar
   na Vercel a variável de ambiente `ALEXA_SKILL_ID` com esse valor.
6. Configurar também `ALEXA_OWNER_EMAIL` na Vercel, com o e-mail da conta
   AURA/ARGUS que a skill deve consultar (a sua).
7. Na aba **Test**, ativar o teste em "Development" e testar direto ali,
   ou no app Alexa do celular / no seu dispositivo Echo, logado com a
   mesma conta Amazon do desenvolvedor.
8. **Não precisa publicar/certificar** para uso pessoal — só funciona nos
   dispositivos ligados à sua própria conta Amazon enquanto estiver em
   "Development".

## O que eu implementei

### Endpoint da skill
`app/api/alexa/route.ts` — recebe e responde no formato exato que a
Alexa exige (`version`, `response.outputSpeech`, `shouldEndSession`):
- `LaunchRequest` (quando você diz só "Alexa, abra AURA ARGUS"): mensagem
  de boas-vindas.
- `AskAuraIntent` / `AskArgusIntent`: extrai a pergunta (`slot query`),
  consulta a IA real da persona correspondente — **com memória e base de
  conhecimento**, igual ao chat do site — e devolve a resposta falada.
- `AMAZON.HelpIntent`, `AMAZON.CancelIntent`, `AMAZON.StopIntent`: ajuda
  e encerramento padrão.
- Texto da resposta passa pela mesma limpeza de emoji/markdown do
  PATCH_073, adaptada para este endpoint (a fala não deve ter símbolos).

### Modelo de interação
`docs/alexa-interaction-model.json` — pronto para importar, com frases
como "pergunte à aura sobre {query}" e "pergunte ao argus sobre {query}".

### Resolução da conta (sem OAuth, por decisão)
`resolveOwnerUserId()` lê `ALEXA_OWNER_EMAIL` e usa `findUserIdByEmail()`
(já existente, criada no PATCH_100) para achar o usuário — mesma conta
sempre, sem múltiplos usuários por enquanto.

### Identidade sem sessão de navegador
Nova função `getIdentityForUserId()` em `lib/identity/server.ts` —
versão de `getCurrentUserIdentity()` que funciona com um `user_id`
conhecido diretamente, em vez de depender de cookie de sessão (a Alexa
não manda cookies do seu navegador).

## Arquivos novos
- `app/api/alexa/route.ts`
- `docs/alexa-interaction-model.json`

## Arquivos alterados
- `lib/identity/server.ts` (`getIdentityForUserId`)

## O que NÃO foi alterado
- Chat do site, login, memória, base de conhecimento — tudo reaproveitado
  sem alteração, só consultado por este novo caminho de entrada.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /api/alexa compilou
```
Testado isoladamente (Node): formato de resposta da Alexa (JSON) e a
limpeza de markdown/emoji do texto antes de virar fala — funcionando
corretamente.

## ⚠️ Limitações de segurança honestas
1. **Verificação de origem fraca.** A Alexa recomenda oficialmente
   verificar a assinatura criptográfica de cada requisição
   (`SignatureCertChainUrl`), confirmando que ela realmente veio dos
   servidores da Amazon. Não implementei essa verificação completa —
   fiz só uma checagem simples do `Skill ID` declarado na requisição, que
   é uma proteção fraca (pode ser falsificada por quem souber a URL e o
   ID). Para uso pessoal, atrás de uma URL não divulgada, o risco é baixo;
   não seria adequado para uma skill pública com muitos usuários sem
   essa verificação completa.
2. **Sem vinculação de conta por usuário** — por decisão, é uma skill
   pessoal fixa, não multi-usuário. Se um dia quiser abrir para clientes
   usarem Alexa também, precisa da camada de OAuth/account linking, que
   é escopo maior, não implementado agora.
3. Não testei contra a Alexa real (não tenho dispositivo nem conta de
   desenvolvedor aqui) — validei só o formato e a lógica isoladamente.

## Teste funcional recomendado
1. Completar os passos de configuração no Alexa Developer Console
   (listados acima).
2. No app Alexa (celular) ou no dispositivo Echo, dizer: "Alexa, abra
   aura argus" — deve ouvir a mensagem de boas-vindas.
3. Dizer: "pergunte à aura sobre meus projetos" — deve ouvir uma resposta
   real, baseada na sua memória/projetos.
4. Testar o mesmo com "pergunte ao argus sobre..." para confirmar a
   segunda persona.

## Status
Implementado e validado por build + testes isolados de formato. Depende
inteiramente da configuração externa no Alexa Developer Console (fora do
meu alcance) para funcionar de ponta a ponta.
