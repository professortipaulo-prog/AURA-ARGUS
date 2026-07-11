# AURA_ARGUS_PATCH_120 — DE_STRESS_MUSIC_BUTTON

## Objetivo
Implementar o "botão de desestresse" pedido por Paulo: um botão no Chat
que abre a música/rádio favorita do usuário numa nova aba — configurável
por pessoa, não fixo.

## Como funciona
1. Em **Configurações**, novo painel "Botão de desestresse 🎵" — o
   usuário cola o link da própria playlist (Spotify, YouTube Music) ou
   de uma rádio online, e salva.
2. No **Chat**, novo botão 🎵 ao lado do microfone e do GPS — clicando,
   abre esse link numa nova aba.
3. Se o usuário ainda não configurou nada, o botão leva direto pra tela
   de Configurações, já no lugar certo pra cadastrar.

## Sugestão pronta para Paulo
Como exemplo/sugestão real (não fixo no código, só uma sugestão de
preenchimento): `https://kissfm.com.br/aovivo/` — confirmado como o site
oficial da Kiss FM São Paulo via busca na web antes de sugerir.

## Arquivos novos
- `app/api/profile/preferences/route.ts` (GET/POST da preferência)
- `components/music-preference-panel.tsx`

## Arquivos alterados
- `app/dashboard/settings/page.tsx` (novo painel)
- `app/dashboard/chat/page.tsx` (botão 🎵 + busca da preferência)

## Onde é guardado
Reaproveitada a coluna `preferences` (jsonb) que já existia em
`core.profiles` desde o início do projeto — sem precisar de tabela ou
migração nova.

## O que NÃO foi alterado
- Nenhuma tabela nova, nenhuma migração.
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 19 testes, todos passando
npm run build           # build completo
```

## Teste funcional recomendado
1. Subir os 4 arquivos.
2. Ir em Configurações → colar `https://kissfm.com.br/aovivo/` (ou
   qualquer link de playlist) → Salvar.
3. Ir no Chat, clicar no botão 🎵, e confirmar que abre o link numa nova
   aba.
4. Testar também sem ter configurado nada (numa conta nova) e confirmar
   que o botão leva pra Configurações em vez de dar erro.

## Status
Implementado e validado por build/testes.
