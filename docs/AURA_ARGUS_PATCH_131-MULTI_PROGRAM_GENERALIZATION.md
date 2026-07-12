# AURA_ARGUS_PATCH_131 — MULTI_PROGRAM_GENERALIZATION_ESTUDANTIL_WORKER

## Objetivo
Corrigir uma falha de escopo real: o PATCH_130 tratou a separação de
experiência (menu, home, redirecionamento) só para "aluno", mesmo tendo
sido claro desde o início que o produto tem 3 níveis (Estudantil,
Worker, Plus). Este patch generaliza toda a estrutura para suportar
Estudantil **e** Worker de verdade, não só remenda o caso do aluno.

## O que foi generalizado

### 1) Tipo de conta, não mais um booleano só para aluno
Trocado o antigo `beta_cohort` (booleano, só dizia "é beta ou não") por
`account_type` (`'estudantil' | 'worker' | 'plus' | null`) — permite
tratar cada nível como categoria própria, com sua navegação e página
inicial. `beta_cohort` continua existindo (ainda controla o prazo de 7
dias), mas a lógica de exibição agora usa `account_type`.

### 2) Menu lateral — 3 variantes, não 2
- **Estudantil**: Central de Estudos, Chat IA, Documentos, Memória,
  Configurações.
- **Worker** (novo): Chat IA, **Ações**, Documentos, Memória,
  Configurações — sem Central de Estudos (não se aplica), com foco em
  produtividade/geração de documentos.
- **Completo** (dono/admin, sem `account_type`): menu de sempre, sem
  mudança.

### 3) Página inicial por tipo de conta
- Estudantil → `/dashboard/estudos`
- Worker → `/dashboard/actions` (a Central de Ações já existente é o
  que mais se aproxima do que um Worker precisa hoje — gerar
  documentos, organizar tarefas)
- Sem tipo (conta completa) → `/dashboard` (Central de Operações), como
  sempre foi

### 4) Formulário de cadastro do beta — um só, para os dois programas
Em vez de duplicar a página, `/beta` agora aceita um parâmetro:
- `/beta` → Estudantil (padrão)
- `/beta?program=worker` → Worker

Cada programa tem sua **própria contagem de vagas**, independente uma da
outra (15 para Estudantil, 15 para Worker — número ajustável por SQL,
cada um numa linha própria da tabela de configuração).

## ⚠️ Limitação honesta — o que NÃO foi criado
Não existe ainda nenhum recurso **específico de Worker**, equivalente à
Central de Estudos (que tem Foco, jogos, Mapa Mental). Hoje, um Worker
beta veria: Chat, Ações (documentos), Documentos, Memória — recursos que
já existem, mas nenhum criado especificamente pensando em rotina
administrativa/profissional (ex: nada como "gerador de planilha de
orçamento" ou "assistente de e-mail corporativo"). Se você quiser
recursos específicos de Worker antes do teste, preciso saber quais.

## Arquivos novos
- `supabase/migrations/0021_account_type.sql`
- `supabase/migrations/0022_beta_config_per_program.sql`

## Arquivos alterados
- `lib/beta/signup.ts` (generalizado para múltiplos programas)
- `app/api/beta/status/route.ts`
- `app/api/beta/signup/route.ts`
- `app/beta/page.tsx` (suporta os 2 programas via URL)
- `components/layout/sidebar.tsx` (3 variantes de menu)
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`

## O que NÃO foi alterado
- Central de Estudos, Central de Ações — funcionalidade interna
  inalterada, só quem chega até elas.
- Contas completas (dono/admin) — sem nenhuma mudança de experiência.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando
npm run build           # build completo — /beta continua estático
                          (2.53 kB), Suspense em volta do useSearchParams
                          funcionou corretamente
```

## Passo extra necessário — 2 migrações novas no Supabase
Rodar, nessa ordem: `0021_account_type.sql`, depois
`0022_beta_config_per_program.sql`.

## Teste funcional recomendado
1. Aplicar as 2 migrações.
2. Subir todos os arquivos.
3. Acessar `/beta` (deve mostrar "AURA & ARGUS Estudantil") e
   `/beta?program=worker` (deve mostrar "AURA & ARGUS Worker") — confirmar
   que os contadores de vaga são independentes um do outro.
4. Cadastrar uma conta de teste em cada programa e confirmar que cada
   uma cai na home certa (Central de Estudos vs. Central de Ações) com
   o menu certo.

## Status
Implementado e validado por build/testes. Migrações não testadas ao
vivo neste ambiente.
