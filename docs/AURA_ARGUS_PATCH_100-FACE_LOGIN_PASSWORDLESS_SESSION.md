# AURA_ARGUS_PATCH_100 — FACE_LOGIN_PASSWORDLESS_SESSION

## ⚠️ Leia isto primeiro — este é o patch mais sensível do projeto até agora
Este patch cria uma sessão de autenticação real **sem senha**. Diferente
de todos os outros patches desta sessão, este mexe diretamente no
mecanismo de acesso a contas. Recomendo fortemente **testar em uma conta
de teste antes de confiar nisso na sua conta principal**, e revisar o
comportamento com atenção redobrada.

## Objetivo
Implementar "Entrar com reconhecimento facial", confirmado por Paulo
como atalho opcional — login por senha continua funcionando sempre,
sem nenhuma alteração.

## Desenho de segurança (decisões deliberadas)

1. **Nunca é busca 1:N.** O usuário precisa digitar o e-mail primeiro.
   O servidor só compara o rosto capturado contra o descritor **daquele
   e-mail especificamente** — nunca varre todos os usuários procurando
   quem parece com o rosto. Isso evita ataques de enumeração e reduz
   drasticamente o risco de falso positivo entre pessoas diferentes.
2. **Mensagem de erro sempre igual** ("Não foi possível entrar com
   reconhecimento facial. Use e-mail e senha."), independente do motivo
   real (e-mail não existe, sem cadastro facial, ou rosto não bate) —
   evita que alguém descubra, por tentativa e erro, quais e-mails têm
   conta no sistema.
3. **Toda tentativa é registrada** em `core.face_verification_log`
   (reaproveitando a tabela do PATCH_099), batendo ou não.
4. Sessão criada via **magic link administrativo do Supabase**
   (`admin.generateLink({ type: 'magiclink' })` +
   `verifyOtp({ token_hash, type: 'magiclink' })`) — mecanismo oficial
   do Supabase para autenticação sem senha, não é workaround não
   documentado.

## Limitação de segurança real, sem maquiagem
Reconhecimento facial 2D simples (o que o `face-api.js` faz) **não tem
prova de vida** — não verifica se é uma pessoa real na frente da câmera
ou uma foto/vídeo de boa qualidade. Por isso:
- Login por rosto é estritamente **mais fraco** que senha como método de
  autenticação.
- Deve continuar sendo **sempre opcional**, nunca o único caminho de
  acesso — é assim que foi implementado, e assim deve continuar.
- Não há limite de tentativas (rate limiting) implementado nesta versão
  — alguém poderia tentar repetidamente. Registrado como pendência de
  segurança abaixo.

## O que foi implementado

### Backend
- `lib/face/server.ts`: nova função `findUserIdByEmail()` — resolve
  e-mail para `user_id` via `core.profiles` (tabela já existente).
- `app/api/auth/face-login/route.ts` (novo): recebe `{ email,
  descriptor }`, resolve o usuário, compara o rosto (reaproveitando
  `verifyFaceDescriptor` do PATCH_099), registra a tentativa, e — se
  bater — gera e consome um magic link administrativo para criar uma
  sessão real, usando o cliente Supabase com acesso a cookies (mesmo
  usado no restante do app) para que os cookies de sessão sejam
  gravados na resposta corretamente.

### Frontend (Login)
- Novo botão discreto "📷 Entrar com reconhecimento facial (opcional)"
  abaixo do formulário de senha — **o formulário de senha não foi
  tocado, nenhuma linha alterada nele**.
- Ao abrir: pede e-mail, ativa câmera, captura, verifica, e — se bater —
  redireciona para o dashboard, exatamente como o login por senha faz.
- Se não bater: mostra a mensagem genérica e sugere usar e-mail/senha.

## Arquivos novos
- `app/api/auth/face-login/route.ts`

## Arquivos alterados
- `lib/face/server.ts` (`findUserIdByEmail`)
- `app/login/page.tsx` (nova seção, aditiva — login por senha intacto)
- `app/globals.css` (estilos da nova seção, aditivo)

## O que NÃO foi alterado
- O formulário e a lógica de login por senha — zero linhas tocadas.
- Nenhuma outra página.
- `middleware.ts` — a proteção de rotas continua igual; a sessão criada
  por reconhecimento facial é uma sessão Supabase real e válida, então
  passa pela mesma verificação de sempre, sem necessidade de mudança ali.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo, /api/auth/face-login compilou;
                       # /login (39.5 kB → 40.6 kB)
```

## ⚠️ Limitações honestas — mais importantes que o normal desta vez
1. **Não tenho como testar a criação real de sessão neste ambiente** —
   não tenho câmera, nem as credenciais reais do Supabase. A chamada
   `generateLink`/`verifyOtp` segue exatamente a documentação oficial do
   Supabase para esse padrão (é um mecanismo usado por muitos apps em
   produção), mas **peço que teste com calma, de preferência numa conta
   secundária primeiro**, antes de confiar nisso no dia a dia.
2. **Sem limite de tentativas.** Não implementei bloqueio após várias
   tentativas falhas — alguém poderia tentar repetidamente contra um
   e-mail conhecido. Para uso pessoal/poucos usuários o risco é baixo,
   mas registrado como pendência real para quando houver mais usuários.
3. Mesma limitação de "sem prova de vida" já explicada acima.

## Pendência de segurança registrada (não implementada)
- Limite de tentativas (rate limiting) por e-mail/IP.
- Notificação ao dono da conta quando um login por rosto acontece (hoje
  só fica registrado no log, não gera alerta ativo).
- Prova de vida (ex: pedir para piscar, virar a cabeça) — reduziria o
  risco de foto/vídeo enganando o sistema.

## Teste funcional recomendado
1. Subir os arquivos deste patch.
2. Ir para a tela de Login (deslogar primeiro, se necessário).
3. Clicar em "Entrar com reconhecimento facial".
4. Digitar o e-mail da conta que já tem rosto cadastrado (PATCH_096).
5. Ativar a câmera, capturar o rosto.
6. Confirmar que entra no dashboard normalmente, como se tivesse
   digitado a senha.
7. Testar também com o e-mail errado ou rosto diferente, e confirmar que
   aparece a mensagem genérica de erro, sem revelar o motivo real.

## Status
Implementado, validado por build, seguindo a documentação oficial do
Supabase para o mecanismo usado. **Não testado com câmera/sessão real**
— pedido explícito de cautela extra no teste, dado o nível de
sensibilidade desta mudança específica.
