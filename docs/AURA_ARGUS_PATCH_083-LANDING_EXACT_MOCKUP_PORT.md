# AURA_ARGUS_PATCH_083 — LANDING_EXACT_MOCKUP_PORT

## Objetivo
Paulo pediu explicitamente "quero o novo que você criou" — ou seja, não
só a direção visual do PATCH_081, mas o conteúdo e o efeito de fundo
exatos do arquivo `opcao-a-cinematico-v2.html` apresentado em conversa.
Este patch fecha essa diferença.

## O que mudou em relação ao PATCH_081

### 1. Chuva de fundo: de CSS para canvas real
O PATCH_081 tinha mantido a chuva de binário que já existia no código
(spans de texto animados via CSS). Este patch **substitui** isso pelo
efeito de canvas do mockup: caracteres aleatórios (`0`, `1`, "AURA",
"ARGUS", katakana) caindo continuamente, desenhados via
`CanvasRenderingContext2D`, exatamente como no arquivo de referência.

Como isso precisa rodar no navegador (não é possível gerar animação de
canvas em um componente de servidor do Next.js), foi criado um novo
componente cliente isolado:
- `components/matrix-rain.tsx` (`'use client'`, `useEffect` + canvas)

### 2. Texto do herói: trocado para o exato do mockup
| Antes (PATCH_081) | Agora (PATCH_083) |
|---|---|
| "Inteligência que vê, compreende e impulsiona resultados." | "Duas mentes. Uma missão." |
| "AURA e ARGUS são assistentes de IA projetados para atuar como um núcleo estratégico..." | "AURA pensa a estratégia. ARGUS executa a operação. Juntas, formam o sistema operacional de inteligência da PSF." |
| "Acessar sistema" | "Acessar o sistema →" |
| "Núcleo de Inteligência Operacional" | "Núcleo Operacional de IA" |

### 3. Limpeza de código morto
- Removido o array `rain` (usado só pela chuva antiga em CSS).
- Removidas as regras CSS `.psfhome-rain` / `.psfhome-rain span` e o
  keyframe `@keyframes psfRain`, que ficaram sem uso.
- Nova regra `.psfhome-matrix-canvas` para o elemento `<canvas>`.

## Arquivos alterados
- `components/matrix-rain.tsx` (novo arquivo)
- `app/page.tsx` (import do componente, troca da chuva, texto do herói)
- `app/globals.css` (CSS da chuva antiga removido, CSS do canvas
  adicionado)

## O que NÃO foi alterado
- Tipografia do título, avatares em corte diagonal (já feito no
  PATCH_081) — mantidos.
- Cards de capacidades, card de anagrama, seção de significado, módulos,
  rodapé — permanecem exatamente como estavam (o mockup original era só
  o herói; o restante da página continua com o conteúdo real).

## Validação executada
```
npm run typecheck   # 0 erros (1 erro de tipo corrigido: acesso a array
                       possivelmente undefined, mesma causa já vista em
                       patches anteriores — guard adicionado)
npm run build         # build completo
```

## Limitação honesta
Sem navegador neste ambiente para captura de tela real — validação por
código (compila, sem erros). Teste visual final depende de Paulo abrir o
site após o deploy.

## Teste funcional recomendado
1. Abrir a landing pública (`aura-argus.vercel.app`, fora do dashboard).
2. Confirmar que a chuva de fundo agora mostra caracteres tipo Matrix
   (0, 1, letras) caindo continuamente, não mais as faixas de texto fixas
   de antes.
3. Confirmar que o título agora diz "Duas mentes. Uma missão." e o botão
   principal diz "Acessar o sistema →".

## Status
Implementado e validado por build. Teste visual real pendente de
confirmação de Paulo.
