# AURA_ARGUS_PATCH_124 — MUSIC_PREFERENCE_UPSERT_FIX

## Objetivo
Corrigir o bug reportado por Paulo: salvar o link de música em
Configurações não fazia efeito — ao clicar no botão 🎵 no Chat, em vez
de abrir a música, redirecionava de volta para Configurações (como se
nada tivesse sido salvo).

## Causa raiz
`app/api/profile/preferences/route.ts` usava `.update()` para salvar a
preferência. `update()` só tem efeito se a linha já existir no banco —
se a linha do perfil daquele usuário ainda não existisse por qualquer
motivo, o `update()` não retorna erro nenhum, mas também não salva nada
(silenciosamente). O `GET` seguinte não encontrava a preferência, e o
botão no Chat, sem link configurado, seguia para Configurações — o
comportamento exato relatado.

## Correção aplicada
Trocado `.update()` por `.upsert(..., { onConflict: 'id' })` — cria a
linha do perfil se ela não existir, ou atualiza se já existir. Mesmo
padrão já usado com sucesso em outras partes do sistema (ex: convite de
clientes, PATCH_109).

## Arquivo alterado
- `app/api/profile/preferences/route.ts`

## O que NÃO foi alterado
- O botão no Chat, o painel de Configurações — nenhuma mudança de
  interface, só a forma de salvar no banco.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 28 testes, todos passando
npm run build           # build completo
```

## Teste funcional recomendado
1. Subir o arquivo.
2. Em Configurações, colar um link de música/rádio e Salvar.
3. Ir no Chat e clicar no botão 🎵 — confirmar que agora abre o link
   numa nova aba, em vez de voltar para Configurações.

## Status
Implementado e validado por build/testes.
