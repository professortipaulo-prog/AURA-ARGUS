# AURA_ARGUS_PATCH_099 — PERIODIC_FACE_VERIFICATION_WITH_CHALLENGE

## Objetivo
Implementar a verificação facial periódica durante o uso do Chat IA,
pedida por Paulo: se o rosto capturado não bater com o cadastro, o chat
é bloqueado até a pessoa se identificar por texto.

## ⚠️ Leia isto antes de tudo — o que este patch É e o que NÃO É
Este patch **não é** uma trava de segurança à prova de mentira. É uma
camada de **registro e desencorajamento**:
- A pessoa não reconhecida digita quem é e por que está usando o sistema.
- Essa resposta **não é verificada automaticamente** — qualquer texto
  digitado destrava o chat.
- O valor real está no **registro** (fica tudo salvo, com data/hora, se
  bateu ou não, e o que a pessoa disse), não em impedir alguém
  malicioso de continuar usando.

Se Paulo quiser uma trava de segurança de verdade (ex: travar a conta,
notificar por e-mail, exigir aprovação remota), isso é um patch maior,
separado — registrado como pendência ao final deste documento.

## Escopo confirmado com Paulo antes de implementar
1. Se o rosto não bater: **bloqueia** o chat até responder (não é só
   aviso).
2. Verificação **periódica** enquanto usa o chat (não só uma vez ao
   abrir).
3. Só se aplica a quem **já cadastrou o rosto** (PATCH_096) — quem nunca
   cadastrou continua sem nenhuma verificação, como sempre.

## O que foi implementado

### Banco de dados
Nova tabela `core.face_verification_log` (migração
`0013_face_verification_log.sql`): guarda cada verificação (bateu ou
não, distância calculada, e a resposta de identificação quando houve
desafio). RLS por `user_id`.

### Comparação de rosto (servidor)
`verifyFaceDescriptor()`: calcula a distância euclidiana entre o
descritor cadastrado e o capturado no momento — mesmo método e mesmo
limiar (0,6) recomendados oficialmente pelo `face-api.js`. Testado
isoladamente com descritores simulados (mesmo rosto com variação
pequena vs. rosto diferente) — o resultado bateu corretamente nos dois
casos antes de considerar pronto.

### Verificação periódica (Chat IA)
Novo componente `FaceGuard`, envolvendo toda a página do Chat:
1. Ao abrir o chat, verifica se o usuário tem rosto cadastrado. Se não
   tiver, não faz nada — zero impacto pra quem não usa a funcionalidade.
2. Se tiver, pede a câmera **uma vez** (não fica pedindo permissão toda
   hora) e mantém aberta em segundo plano, sem mostrar o vídeo na tela.
3. A cada **4 minutos**, captura o rosto atual e compara com o
   cadastrado.
4. Se bater: nada acontece, uso normal continua.
5. Se não bater (ou nenhum rosto for detectado): a tela inteira fica
   bloqueada por uma sobreposição vermelha, pedindo identificação por
   texto. Só depois de responder e enviar, o chat volta a funcionar.

### Falhas não bloqueiam o uso
Se a câmera falhar, o modelo não carregar, ou qualquer erro técnico
acontecer na verificação, o sistema **não bloqueia** — prefere falhar
de forma segura para o uso normal continuar, em vez de travar alguém
legítimo por um problema técnico.

## Arquivos novos
- `supabase/migrations/0013_face_verification_log.sql`
- `app/api/face/verify/route.ts`
- `app/api/face/challenge-response/route.ts`
- `components/face-guard.tsx`

## Arquivos alterados
- `lib/face/server.ts` (`verifyFaceDescriptor`, `logFaceVerification`)
- `app/dashboard/chat/page.tsx` (chat envolvido pelo `FaceGuard`)
- `app/globals.css` (CSS da sobreposição de bloqueio, aditivo)

## O que NÃO foi alterado
- Login por senha — continua exatamente igual, nunca é afetado por essa
  verificação periódica.
- Cadastro facial (PATCH_096/098) — reaproveitado sem alteração.
- Nenhuma outra página além do Chat recebeu essa verificação (Central de
  Operações, Documentos, etc. continuam sem essa checagem).

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /dashboard/chat (8.95 kB → 9.79 kB)
```
Lógica de comparação (distância euclidiana + limiar) testada
isoladamente com descritores simulados — reconheceu corretamente "mesmo
rosto" (distância baixa) e "rosto diferente" (distância alta).

## ⚠️ Limitações honestas
1. **Sem câmera neste ambiente** — não testei a detecção real de rosto
   nem o fluxo de bloqueio de ponta a ponta.
2. **A resposta de identificação não é verificada** — é registro, não
   controle de acesso real (explicado em detalhe no topo deste
   documento).
3. Se alguém souber que existe essa checagem, pode simplesmente digitar
   qualquer coisa no desafio e continuar usando — o bloqueio existe para
   desencorajar e registrar, não para impedir de fato.
4. A verificação a cada 4 minutos consome câmera continuamente em segundo
   plano enquanto o chat estiver aberto — isso é visível para o usuário
   (indicador de câmera ativa do navegador/sistema operacional).

## Pendência registrada — segurança real (não implementada)
Se no futuro Paulo quiser controle de acesso de verdade (não só
registro), as opções seriam: bloquear a sessão de verdade (invalidar o
token de autenticação), notificar o dono por e-mail/push em tempo real,
ou exigir aprovação remota antes de destravar. Isso é escopo maior, não
implementado agora — fica como decisão futura.

## Teste funcional recomendado
1. Aplicar a migração `0013_face_verification_log.sql`.
2. Subir os arquivos deste patch.
3. Com o rosto já cadastrado (PATCH_096/098), abrir o Chat IA e permitir
   a câmera quando pedido (deve pedir só uma vez).
4. Esperar ~4 minutos (ou, para testar mais rápido, pedir para eu reduzir
   o intervalo temporariamente) e continuar com o mesmo rosto na câmera —
   confirmar que nada trava.
5. Testar cobrindo a câmera ou saindo do quadro durante uma verificação —
   confirmar que a tela de bloqueio aparece, pedindo identificação.
6. Digitar uma resposta e confirmar que o chat destrava.

## Status
Implementado e validado por build + teste isolado da lógica de
comparação. Teste real com câmera pendente de confirmação de Paulo.
