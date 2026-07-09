# AURA_ARGUS_PATCH_093 — BROWSER_GEOLOCATION_REAL_LOCATION

## Objetivo
Implementar a geolocalização real que ficou registrada como opção no
PATCH_092 — o navegador pede permissão de GPS, e a localização real do
usuário passa a ser usada nas respostas sobre clima/horário local, em
vez de precisar digitar a cidade toda vez.

## O que foi implementado

### Frontend (Chat IA)
- Novo botão 📍 no composer, ao lado do microfone.
- Ao clicar, usa `navigator.geolocation.getCurrentPosition()` (API nativa
  do navegador) — pede permissão explícita ao usuário, como qualquer
  site que usa localização.
- Coordenadas (latitude/longitude) ficam guardadas na sessão do chat e
  são enviadas junto de cada mensagem daquele ponto em diante.
- Linha de status abaixo do campo de texto mostra se a localização está
  ativada, negada, ou ainda não solicitada.

### Backend
- `lib/location/server.ts` (novo): `resolveLocationLabel(lat, lon)` —
  geocodificação reversa (transforma coordenadas em nome de cidade/estado)
  usando o **Nominatim** (OpenStreetMap), um serviço público e gratuito,
  sem necessidade de chave de API. Segue a política de uso do serviço
  (User-Agent identificando a aplicação).
- `app/api/ai/chat/route.ts`: quando a mensagem chega com `location`
  (lat/lon), resolve o nome da cidade e monta um bloco de contexto de
  **prioridade máxima** — acima até da memória e da base de conhecimento
  — instruindo a IA a usar essa localização real para clima, horário
  local ou "onde estou", já que é mais confiável que qualquer suposição.

## Arquivos alterados/novos
- `lib/location/server.ts` (novo)
- `lib/ai/types.ts` (`ChatRequestBody.location`)
- `app/api/ai/chat/route.ts` (resolução de localização + prioridade no
  prompt)
- `app/dashboard/chat/page.tsx` (botão de GPS, estado, envio da
  localização)

## O que NÃO foi alterado
- Nenhuma outra página, nenhum outro componente.
- O comportamento sem localização ativada continua igual ao do
  PATCH_092 (a IA pergunta a cidade em vez de assumir).

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat (8.58 kB → 8.89 kB)
```

## ⚠️ Limitações honestas
1. **Não consegui testar a chamada real ao Nominatim** — o domínio
   `nominatim.openstreetmap.org` não está liberado na lista de rede do
   meu ambiente de desenvolvimento. Segui exatamente o formato
   documentado publicamente da API (`format=jsonv2`, endpoint
   `/reverse`), mas só um teste ao vivo confirma 100%.
2. **A localização não é automática nem permanente** — precisa clicar no
   botão 📍 a cada nova sessão/aba (o navegador não guarda permissão de
   GPS entre recarregamentos de página por padrão, é assim que a API do
   navegador funciona).
3. Depende do usuário **permitir** o acesso à localização quando o
   navegador perguntar — se negar, o sistema volta ao comportamento do
   PATCH_092 (pergunta a cidade em vez de adivinhar).

## Teste funcional recomendado
1. Subir os 4 arquivos.
2. Aguardar o deploy terminar.
3. No Chat IA, clicar no botão 📍 e permitir o acesso à localização
   quando o navegador pedir.
4. Confirmar que a linha de status muda para "Localização ativada 📍".
5. Perguntar "onde estou e qual o clima agora?" e confirmar que a
   resposta usa a cidade real (não pergunta mais, e não inventa
   Salvador).

## Status
Implementado e validado por build. Chamada real ao serviço de
geocodificação não testada neste ambiente — depende de teste ao vivo.
