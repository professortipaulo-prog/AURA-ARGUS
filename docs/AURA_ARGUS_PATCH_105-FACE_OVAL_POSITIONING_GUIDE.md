# AURA_ARGUS_PATCH_105 — FACE_OVAL_POSITIONING_GUIDE

## Objetivo
Adicionar uma guia visual oval sobre o preview da câmera, tanto no
cadastro facial quanto no login por rosto, ajudando o usuário a
posicionar o rosto sempre de forma parecida — sugestão de Paulo, que
também ajuda indiretamente o problema do PATCH_104 (menos variação de
enquadramento entre cadastro e login tende a gerar descritores mais
consistentes, reduzindo a distância calculada).

## O que foi implementado
- Novo elemento visual: uma área oval tracejada, com leve brilho na cor
  da persona ativa, sobreposta ao vídeo da câmera — a área fora do oval
  fica sutilmente escurecida, guiando o olhar para dentro da guia.
- Texto de apoio acima do vídeo: "Posicione seu rosto dentro da área
  oval."
- Aplicado nos 2 lugares que usam câmera para rosto: cadastro
  (Configurações) e login por reconhecimento facial.

## Arquivos alterados
- `components/face-enrollment.tsx` (cadastro)
- `app/login/page.tsx` (login por rosto)
- `app/globals.css` (`.aios-face-video-wrap`, `.aios-face-oval-guide`,
  aditivo — nenhuma regra existente foi alterada)

## O que NÃO foi alterado
- A lógica de captura/comparação de rosto — a guia é 100% visual, não
  interfere na detecção real (o `face-api.js` continua analisando o
  frame inteiro, a guia é só uma referência para a pessoa se posicionar).
- Nenhuma outra página.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Subir os arquivos deste patch.
2. Abrir o cadastro facial (Configurações) e confirmar que aparece a
   guia oval tracejada sobre o vídeo da câmera.
3. Testar o mesmo na tela de login, ao ativar "Entrar com reconhecimento
   facial".
4. Se quiser, cadastre o rosto de novo posicionando-se dentro da guia, e
   teste o login — isso pode reduzir ainda mais a distância calculada
   (além do ajuste do PATCH_104).

## Status
Implementado e validado por build.
