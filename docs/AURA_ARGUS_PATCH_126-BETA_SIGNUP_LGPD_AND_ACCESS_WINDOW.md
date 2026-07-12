# AURA_ARGUS_PATCH_126 — BETA_SIGNUP_LGPD_AND_ACCESS_WINDOW

## Objetivo
Página pública de cadastro para o teste beta: vagas limitadas (15),
formulário pensado para LGPD, cadastro de menores feito pelo
responsável, e o período de acesso (7 dias) contado a partir do
**primeiro login real**, não da data do cadastro.

## O que foi implementado

### 1) Formulário público — `/beta`
- Mostra quantas vagas restam (busca em tempo real).
- Alterna entre dois modos: "Sou aluno (18+)" ou "Sou responsável por
  menor de 18 anos" — muda os campos pedidos.
- Campos do aluno adulto: nome, data de nascimento, e-mail, senha.
- Campos quando é responsável: nome do aluno, data de nascimento do
  aluno, nome do responsável, e-mail do responsável (esse e-mail vira o
  login da conta — é o responsável que efetivamente acessa/gerencia).
- Checkbox de consentimento LGPD obrigatório, com texto diferente para
  cada caso (consentimento próprio vs. consentimento do responsável por
  menor).
- Quando as vagas acabam, o formulário desaparece e mostra "Vagas
  encerradas".

### 2) Determinação de menor de idade — testada antes de integrar
A idade é calculada a partir da data de nascimento, considerando mês e
dia (não só o ano) — testei isoladamente 6 casos, incluindo os limites
mais delicados (quem faz 18 anos exatamente hoje, quem faz 18 amanhã e
ainda é menor por 1 dia) antes de integrar ao código real. Todos os 6
corretos.

### 3) Vagas limitadas — 15, configurável
Nova tabela `core.beta_config` (linha única) guarda o número de vagas.
A cada cadastro, conta quantas contas já têm `beta_cohort = true` e
compara com o limite — quando bate, novos cadastros são recusados.

### 4) Relógio de 7 dias — a partir do primeiro acesso, não do cadastro
Esse foi o ponto mais delicado de acertar. A conta é criada no
cadastro, mas o campo `first_access_at` só é preenchido no **primeiro
login de verdade** (dentro da mesma rota que já roda a cada login,
`/api/auth/profile`). O layout do dashboard confere, em toda página, se
já passaram mais de 7 dias desde esse primeiro acesso — se sim, redireciona
para `/beta/expired` em vez de deixar continuar usando.

### 5) Bug real encontrado e corrigido no caminho
A rota `/api/auth/profile` (que roda a cada login) estava **sobrescrevendo
completamente** o campo de preferências do usuário a cada vez —
incluindo a música favorita salva (PATCH_120/124), que seria apagada no
próximo login sem ninguém perceber. Corrigido: agora busca as
preferências atuais primeiro e só adiciona/atualiza os campos
relevantes, preservando o resto.

## Arquivos novos
- `supabase/migrations/0019_beta_signup.sql`
- `lib/beta/signup.ts`
- `app/api/beta/status/route.ts`
- `app/api/beta/signup/route.ts`
- `app/beta/page.tsx` (formulário)
- `app/beta/expired/page.tsx`

## Arquivos alterados
- `app/api/auth/profile/route.ts` (correção do bug de preferências +
  registro do primeiro acesso)
- `app/dashboard/layout.tsx` (checagem dos 7 dias)
- `app/globals.css` (estilo do formulário, aditivo)

## O que NÃO foi alterado
- `/register` continua bloqueado (cadastro fechado) — o `/beta` é uma
  porta de entrada específica e separada, só para este teste.
- Login por senha/reconhecimento facial — inalterados.
- A Central de Estudos, Chat, Documentos — nenhuma mudança de
  funcionalidade, só quem pode acessar e por quanto tempo.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando
npm run build           # build completo — /beta (1.77 kB), /beta/expired,
                          /api/beta/signup, /api/beta/status compilaram
```
Cálculo de idade testado isoladamente (6 casos, incluindo limites do
aniversário de 18 anos) antes de integrar.

## ⚠️ Pontos de atenção sobre LGPD — honestos, não sou advogado
Implementei com boa prática de proteção de dados (consentimento
explícito, registro de quando o consentimento foi dado, responsável
como titular da conta de menor), mas **isto não substitui uma revisão
jurídica real** se você quiser formalizar isso como processo
institucional permanente (não só um teste pequeno e controlado). Para
um teste de 15 pessoas que você mesmo está selecionando e acompanhando,
isso é uma base sólida — para algo maior, recomendo confirmar com
alguém da área jurídica.

## ⚠️ Outras limitações honestas
1. Não testei o cadastro real neste ambiente (sem banco/API ao vivo).
2. O e-mail de confirmação do Supabase é pulado (`email_confirm: true`)
   — a pessoa já pode logar assim que cadastra, sem precisar clicar em
   link de confirmação. Isso é intencional (grupo pequeno e de
   confiança), mas é uma escolha de segurança mais permissiva do que o
   padrão.
3. Se alguém perder a senha, hoje não existe fluxo de "esqueci minha
   senha" testado — vale confirmar se o Supabase já tem isso configurado
   antes do teste começar.

## Passo extra necessário — migração no Supabase
Rodar `supabase/migrations/0019_beta_signup.sql` no SQL Editor antes de
divulgar o link `/beta`.

## Teste funcional recomendado
1. Aplicar a migração.
2. Subir todos os arquivos.
3. Acessar `/beta` e testar o cadastro como aluno adulto.
4. Testar o cadastro como responsável por um menor (marcar a caixinha).
5. Confirmar que о contador de vagas diminui a cada cadastro, e que ao
   chegar em 0 o formulário não aparece mais.
6. Fazer login com uma conta de teste e confirmar acesso normal ao
   dashboard.
7. (Opcional, mais difícil de testar sem esperar 7 dias reais): alterar
   manualmente `first_access_at` no banco para mais de 7 dias atrás e
   confirmar que o redirecionamento para `/beta/expired` funciona.

## Status
Implementado e validado por build/testes automatizados (incluindo o
cálculo de idade, testado isoladamente com casos de borda). Fluxo
completo de cadastro real não testado neste ambiente — depende de teste
ao vivo antes de divulgar o link aos 15 participantes.
