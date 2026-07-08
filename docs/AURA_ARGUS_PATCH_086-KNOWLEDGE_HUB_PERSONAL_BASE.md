# AURA_ARGUS_PATCH_086 — KNOWLEDGE_HUB_PERSONAL_BASE

## Objetivo
Construir uma base de conhecimento própria do AURA/ARGUS — o usuário
sobe arquivos (PDF, Word, texto), e a IA passa a consultar esse material
automaticamente ao responder no chat e ao gerar documentos. É o
substituto real, funcionando hoje, para o pedido de "NotebookLM conectado
à conta do usuário" — que continua impossível de fazer oficialmente
(NotebookLM pessoal não tem API pública; só a versão Enterprise paga
tem, conforme já explicado em conversa anterior).

## O que foi implementado

### Banco de dados e armazenamento
- Nova tabela `core.knowledge_files` (migração `0011_knowledge_hub.sql`):
  metadados do arquivo + texto extraído + status da extração. RLS por
  `user_id`, mesmo padrão das tabelas de memória e ações.
- Novo bucket de Storage do Supabase, `knowledge-hub` (privado, não
  público), criado na mesma migração, com policies que restringem cada
  usuário à sua própria pasta (`{user_id}/arquivo`).

### Extração de texto
Bibliotecas novas instaladas: `pdf-parse` (PDF) e `mammoth` (Word/.docx).
Testadas isoladamente, gerando um PDF/DOCX reais e extraindo o texto de
volta, antes de considerar a integração pronta:
- PDF: `new PDFParse({ data: buffer }).getText()` → confirmado funcionando.
- DOCX: `mammoth.extractRawText({ buffer })` → confirmado funcionando.
- TXT/MD: leitura direta como UTF-8.
- Outros formatos: arquivo é salvo normalmente, mas marcado como "não
  suportado para leitura pela IA" — não trava nem falha o upload.

### Busca de contexto (v1 — por palavra-chave)
`getKnowledgeContext(userId, query)`: busca todos os arquivos com texto
extraído do usuário, conta quantas palavras da pergunta (com mais de 3
letras) aparecem no texto de cada arquivo, e retorna os mais relevantes
(até 3 arquivos, 3000 caracteres cada) como um bloco de contexto.

**Testado isoladamente** com 3 documentos simulados (currículo, notas de
reunião, manual técnico) e 3 perguntas diferentes — em todos os casos, o
arquivo certo foi priorizado, e uma pergunta sem relação nenhuma retornou
vazio (nenhum arquivo forçado a aparecer).

### Onde isso é consultado
- **Geração de documentos** (`lib/actions/server.ts`, a elaboração via IA
  do PATCH_085): a base de conhecimento agora entra no mesmo prompt que
  já leva a memória do usuário.
- **Chat** (`app/api/ai/chat/route.ts`): mesma integração — AURA e ARGUS
  passam a poder citar informações dos arquivos enviados, quando
  relevante à pergunta.

### Interface
Página `/dashboard/documents` (antes um placeholder "em preparação")
virou a Central de Conhecimento de verdade: upload de arquivo, lista dos
arquivos enviados com status ("Pronto para consulta pela IA" /
"Salvo, mas não legível" / "Erro ao ler"), botão de remover.

## Arquivos novos
- `supabase/migrations/0011_knowledge_hub.sql`
- `lib/knowledge/server.ts`
- `app/api/knowledge/upload/route.ts`
- `app/api/knowledge/list/route.ts`
- `app/api/knowledge/[id]/route.ts`

## Arquivos alterados
- `package.json` / `package-lock.json` (novas dependências: `pdf-parse`,
  `mammoth`)
- `lib/actions/server.ts` (busca contexto da base de conhecimento antes
  de elaborar o documento)
- `app/api/ai/chat/route.ts` (idem, para o chat)
- `app/dashboard/documents/page.tsx` (reescrita completa — antes era
  `EmptyState` estático)

## O que NÃO foi alterado
- Outras páginas, Action Engine, Memory Engine, Identity Engine — só
  consultados, não modificados em sua lógica interna.
- CSS/layout — a nova página reaproveita 100% das classes já existentes
  (`aios-panel`, `aios-form-control`, `aios-capability`, etc.), nenhuma
  classe nova criada.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo — 3 rotas novas de API + página
                       # /dashboard/documents (1.71 kB) compilaram sem erro
```
Testado isoladamente (Node, sem depender do Supabase real):
- Extração de PDF e DOCX com arquivos gerados de verdade.
- Algoritmo de relevância por palavra-chave, com 3 documentos simulados e
  3 perguntas diferentes — resultado correto nos 3 casos.

## ⚠️ Limitações honestas, registradas
1. **Não testado contra o Supabase real** — preciso que a migração seja
   aplicada em produção e que você faça um upload de teste para eu (ou
   você) confirmar que o fluxo completo funciona.
2. **Busca por palavra-chave, não por significado.** Se o usuário perguntar
   algo com palavras muito diferentes do texto do documento (sinônimos,
   parafraseado), pode não encontrar o arquivo certo. Uma evolução futura
   seria busca vetorial/embeddings (mais precisa, mas exige gerar e
   armazenar vetores — escopo maior, não feito agora).
3. **Só PDF, DOCX, TXT, MD são lidos pela IA hoje.** Excel, PowerPoint,
   imagens podem ser enviados (ficam salvos), mas não entram no contexto
   da IA ainda.
4. Limite de 15MB por arquivo (ajustável se necessário).

## Teste funcional recomendado
1. Aplicar a migração `0011_knowledge_hub.sql` no Supabase (via SQL
   Editor ou CLI).
2. Abrir `/dashboard/documents`, enviar um PDF ou .docx com informação
   real sobre você (ex: um currículo, ou notas de um projeto).
3. Confirmar que aparece na lista com status "Pronto para consulta pela
   IA".
4. Ir ao Chat IA e perguntar algo que só pode ser respondido usando esse
   arquivo (ex: "o que diz meu currículo sobre minha experiência?").
5. Confirmar que a resposta reflete o conteúdo real do arquivo enviado.

## Status
Implementado e validado por build + testes isolados de extração e busca.
Depende de: (a) aplicar a migração no Supabase, (b) teste ao vivo com
upload real, para fechar com certeza total.
