# AURA_ARGUS_PATCH_087 — KNOWLEDGE_UPLOAD_SERVERLESS_BUNDLING_FIX

## Objetivo
Corrigir erro 500 reportado por Paulo ao tentar enviar um arquivo pela
Central de Conhecimento (PATCH_086).

## Diagnóstico
A resposta do erro (visto no DevTools → Network) era a página de erro
genérica do próprio Next.js (`content-type: text/html`,
`x-matched-path: /500`), não o JSON de erro que a rota
`/api/knowledge/upload` deveria devolver mesmo em caso de falha. Isso
indica que a função quebrou **antes** do meu código conseguir capturar o
erro no `try/catch` — normalmente sinal de erro no carregamento de um
módulo, não na lógica em si.

**Hipótese mais provável:** `pdf-parse` (biblioteca nova do PATCH_086)
depende internamente do `pdf.js`, que em alguns cenários tenta carregar
arquivos auxiliares (worker) por caminho de arquivo. O Next.js, por
padrão, tenta empacotar (via webpack) tudo que é importado em uma rota de
API — e esse empacotamento pode quebrar esse tipo de dependência em
tempo de execução no ambiente serverless da Vercel, mesmo funcionando
perfeitamente aqui no meu ambiente de teste local (Node puro, sem
Next.js/webpack no meio).

## Correção aplicada
`next.config.js`: adicionado `pdf-parse` e `mammoth` à lista
`experimental.serverComponentsExternalPackages` — isso instrui o Next a
**não** tentar empacotar essas duas bibliotecas, usando-as como pacotes
Node normais em tempo de execução (que é como elas foram testadas e
funcionaram no meu ambiente).

## Arquivo alterado
- `next.config.js` (única alteração)

## O que NÃO foi alterado
- Nenhuma lógica de `lib/knowledge/server.ts`, rotas de API, ou a página
  `/dashboard/documents` — o problema (se for esse) está no empacotamento,
  não na lógica.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## ⚠️ Limitação honesta — correção não 100% confirmada
Não tenho acesso aos logs reais de execução da função na Vercel, só ao
que o navegador mostra (que é insuficiente para ver a causa exata). Esta
é a correção mais provável, baseada em um padrão de falha conhecido dessa
combinação de bibliotecas — mas não posso garantir que resolve sem
teste real.

**Se o erro persistir depois deste patch**, preciso que Paulo copie o
log real da função, direto do painel da Vercel:
1. Painel da Vercel → projeto `aura-argus` → aba **Deployments**.
2. Abrir o deployment mais recente → aba **Functions** (ou **Runtime
   Logs**, dependendo da versão da interface).
3. Tentar enviar o arquivo de novo no site, e ver o log aparecer em tempo
   real ali — ele mostra o stack trace exato do erro 500, que o DevTools
   do navegador não mostra.

## Teste funcional recomendado
1. Subir `next.config.js`.
2. Aguardar o novo deploy terminar (status "Ready").
3. Tentar enviar o mesmo arquivo de antes pela Central de Conhecimento.
4. Se funcionar: confirma a hipótese. Se não funcionar: seguir o passo de
   pegar o log real da Vercel, descrito acima.

## Status
Correção aplicada com base em diagnóstico bem fundamentado, mas não
confirmada por teste real — depende do resultado do próximo teste de
Paulo.
