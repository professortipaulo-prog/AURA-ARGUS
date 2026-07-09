# AURA_ARGUS_PATCH_096 — FACE_ENROLLMENT_WITH_CONSENT

## Objetivo
Implementar a primeira fatia real de Reconhecimento Facial: o
**cadastro** do rosto, com consentimento explícito, seguindo o escopo
decidido por Paulo em conversa: (1) atalho **opcional** — senha sempre
funciona; (2) servidor guarda um **identificador matemático** do rosto,
não a foto.

## Escopo desta sessão vs. próxima etapa
Este patch entrega o **cadastro** completo e funcional. O **login usando
o rosto** (verificação 1:1 para autenticar sem senha) foi
**deliberadamente adiado** — não por esquecimento, mas porque criar uma
sessão de autenticação sem senha é uma área de alto risco de segurança
(um erro ali poderia permitir acesso indevido a contas). Prefiro
desenhar e revisar essa parte com mais cuidado numa próxima etapa, em vez
de arriscar uma falha de autenticação para entregar rápido.

## O que foi implementado

### Banco de dados
Nova tabela `core.face_enrollments` (migração `0012_face_enrollments.sql`):
- `descriptor jsonb` — vetor de 128 números gerado pelo `face-api.js` no
  navegador do usuário. **Nunca a foto, nunca o vídeo.**
- RLS por `user_id`, mesmo padrão das outras tabelas do projeto.
- `unique(user_id)` — um cadastro por usuário (novo cadastro substitui o
  anterior).

### Modelos de IA (reconhecimento facial no navegador)
Biblioteca `face-api.js` instalada, e os 3 modelos pré-treinados
necessários baixados para `public/models/` (verificados como JSON válido
e tamanhos corretos antes de considerar prontos):
- `tiny_face_detector` — detecta onde está o rosto na imagem.
- `face_landmark_68` — encontra os pontos de referência do rosto.
- `face_recognition` — gera o descritor de 128 números a partir do rosto.

Todo o processamento acontece **no navegador do usuário** — a foto/vídeo
nunca sai do dispositivo dele.

### Fluxo de consentimento (antes de qualquer acesso à câmera)
Em `/dashboard/settings`, novo painel "Reconhecimento facial":
1. Explica claramente o que vai acontecer, o que é guardado (só o
   identificador, não a foto) e que a senha nunca deixa de funcionar.
2. Só depois do usuário clicar "Concordo, ativar câmera" é que o
   navegador pede permissão de câmera.
3. Usuário vê o preview da própria câmera, clica "Capturar rosto".
4. Se nenhum rosto for detectado, erro claro pedindo pra se aproximar/
   melhorar iluminação — não falha silenciosamente.
5. Descritor calculado localmente e enviado ao servidor.
6. Câmera desligada automaticamente após o cadastro.
7. Usuário pode remover o cadastro a qualquer momento, sem afetar login
   por senha.

## Arquivos novos
- `supabase/migrations/0012_face_enrollments.sql`
- `lib/face/server.ts`
- `app/api/face/enroll/route.ts` (GET status, POST cadastrar, DELETE remover)
- `components/face-enrollment.tsx`
- `public/models/*` (7 arquivos de modelo pré-treinado, ~7MB)

## Arquivos alterados
- `package.json` / `package-lock.json` (`face-api.js`)
- `app/dashboard/settings/page.tsx` (inclui o novo painel)
- `app/globals.css` (CSS do preview de câmera, aditivo)
- `modules/faceid/index.ts`, `modules/faceid/README.md` (status atualizado)

## O que NÃO foi alterado
- Login (`app/login/page.tsx`) — continua exatamente como antes, só por
  senha. A integração de "entrar com o rosto" fica para uma próxima
  etapa, com o cuidado extra que autenticação exige.
- Nenhuma outra página, nenhum outro componente.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo — /api/face/enroll e
                       # /dashboard/settings (2.29 kB) compilaram sem erro
```
Arquivos de modelo verificados (JSON válido, tamanhos corretos) antes de
considerar prontos. Toda a lógica de `face-api.js` roda em componente
cliente (`'use client'`) — nunca no servidor — então não há risco do
mesmo tipo de falha que tivemos com `pdf-parse` (que quebrava por rodar
no ambiente serverless sem DOM).

## ⚠️ Limitação honesta
Não tenho câmera neste ambiente de desenvolvimento — não consegui testar
o fluxo de captura de rosto de ponta a ponta. A lógica segue a
documentação oficial do `face-api.js`, mas só um teste real (com câmera
de verdade) confirma 100%.

## Teste funcional recomendado
1. Aplicar a migração `0012_face_enrollments.sql` no Supabase.
2. Subir os arquivos deste patch, incluindo a pasta `public/models/`
   inteira.
3. Ir em Configurações → "Ativar reconhecimento facial".
4. Ler a tela de consentimento, clicar "Concordo, ativar câmera".
5. Permitir o acesso à câmera quando o navegador pedir.
6. Clicar "Capturar rosto" e confirmar que aparece "Rosto cadastrado".
7. Clicar "Remover cadastro facial" e confirmar que volta ao estado
   inicial.

## Status
Cadastro implementado e validado por build. Teste real com câmera
pendente de confirmação de Paulo. Login com reconhecimento facial fica
como próxima etapa, por decisão deliberada de segurança.
