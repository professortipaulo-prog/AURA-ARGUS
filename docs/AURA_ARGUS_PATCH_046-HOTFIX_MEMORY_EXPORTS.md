# AURA_ARGUS_PATCH_046-HOTFIX_MEMORY_EXPORTS

## Objetivo
Corrigir a falha de build na Vercel causada pela ausência dos exports `getMemoryContext` e `getMemoryStatus` em `lib/memory/server.ts`.

## Problema corrigido
A Vercel falhava durante a etapa de validação de tipos com o erro:

```text
Module '"@/lib/memory/server"' has no exported member 'getMemoryContext'.
Module '"@/lib/memory/server"' has no exported member 'getMemoryStatus'.
```

As rotas antigas abaixo ainda dependem desses exports:

```text
app/api/memory/context/route.ts
app/api/memory/status/route.ts
```

## Arquivo alterado
```text
lib/memory/server.ts
```

## Alteração realizada
Foram adicionadas funções de compatibilidade no final de `lib/memory/server.ts`:

```text
getMemoryContext
getMemoryStatus
```

Essas funções reaproveitam a lógica atual do PATCH 046:

```text
getOrCreateActiveProject
getProjectMemoryContext
memoryPromptBlock
getMemoryOverview
```

## O que não foi alterado
- Não altera Landing Page.
- Não altera visual do Chat IA.
- Não altera `globals.css`.
- Não cria módulo novo.
- Não altera banco de dados.
- Não altera AI Router.

## Validação técnica
Validação local executada:

```text
npx tsc --noEmit
```

Resultado:

```text
status=0
```

O `next build` compilou e passou pela etapa de tipos sem repetir o erro dos exports. A execução completa pode demorar no ambiente local durante geração de páginas, mas o erro informado pela Vercel foi corrigido.

## Instrução de envio para GitHub
Enviar somente estes arquivos:

```text
lib/memory/server.ts
docs/AURA_ARGUS_PATCH_046-HOTFIX_MEMORY_EXPORTS.md
```

## Teste esperado na Vercel
Depois do commit, o deploy não deve mais falhar nos imports:

```text
getMemoryContext
getMemoryStatus
```
