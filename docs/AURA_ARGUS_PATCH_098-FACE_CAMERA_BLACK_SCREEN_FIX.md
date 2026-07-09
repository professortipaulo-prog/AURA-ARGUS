# AURA_ARGUS_PATCH_098 — FACE_CAMERA_BLACK_SCREEN_FIX

## Objetivo
Corrigir bug reportado por Paulo: ao ativar o reconhecimento facial, a
câmera era autorizada normalmente (confirmado pelo próprio indicador do
Chrome, que mostrava a imagem real da câmera funcionando), mas o preview
na página ficava completamente **preto**.

## Causa raiz
O elemento `<video>` só é **montado no DOM** quando `status === 'camera-on'`
(renderização condicional em React). O código antigo tentava conectar o
stream da câmera (`videoRef.current.srcObject = stream`) **antes** de
mudar o status para `'camera-on'` — ou seja, tentava acessar um elemento
`<video>` que ainda nem existia na tela. Como `videoRef.current` era
`null` nesse momento, a conexão nunca acontecia — só depois é que o
elemento aparecia (já sem nenhum stream conectado), daí a tela preta.

O navegador continuava mostrando a câmera como "ativa" (seu próprio
indicador de permissão) porque o hardware da câmera realmente estava
ligado e capturando — só nunca chegava a ser exibido na minha página.

## Correção aplicada
1. `setStatus('camera-on')` passou a acontecer **antes** de tentar
   conectar o stream ao vídeo — isso garante que o React monte o
   elemento `<video>` na tela.
2. Novo `useEffect`, que observa o `status`: assim que vira `'camera-on'`
   (e o elemento já existe garantidamente no DOM), conecta o stream
   guardado (`streamRef.current`) ao vídeo e inicia a reprodução.

## Arquivo alterado
- `components/face-enrollment.tsx` (única alteração)

## O que NÃO foi alterado
- Migração do banco, rotas de API, modelos de IA — nada disso tinha
  relação com esse bug, que era puramente de ordem de renderização no
  componente.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## ⚠️ Limitação honesta
Continuo sem câmera neste ambiente — não posso confirmar visualmente que
o preview aparece corretamente agora, só corrigi a causa exata que os
prints mostraram (ordem de montagem do elemento). Depende do seu teste
real para confirmação final.

## Teste funcional recomendado
1. Subir `components/face-enrollment.tsx`.
2. Aguardar o deploy terminar.
3. Repetir o mesmo teste: Configurações → Ativar reconhecimento facial →
   Concordo → permitir câmera.
4. Confirmar que agora aparece o preview real da sua câmera (não mais
   tela preta).
5. Clicar "Capturar rosto" e confirmar "Rosto cadastrado".

## Status
Corrigido com causa raiz clara, identificada diretamente pelos prints
enviados (evidência real, não suposição). Teste visual final pendente.
