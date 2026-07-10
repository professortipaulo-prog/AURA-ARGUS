# AURA_ARGUS_PATCH_113 — TRANSPARENT_ANIMATED_CONNECTOR_SYMBOL

## Objetivo
Ajustar o símbolo de conexão entre AURA e ARGUS (PATCH_112): Paulo pediu
que ele tivesse movimento real e **nunca cobrisse** a animação de chuva
matrix de fundo.

## O que mudou
O símbolo antes era um badge circular sólido (56px, com fundo em
gradiente e brilho) — mesmo sendo pequeno, tinha uma área de fundo
preenchida que tampava um pedaço da animação atrás dele.

Agora:
- **Sem nenhum fundo** (`background: none`, sem borda, sem
  `box-shadow`) — só o símbolo "⇄" em si fica visível, a chuva matrix
  aparece livremente ao redor e por trás.
- **Flutua** suavemente para cima e para baixo (`psfhomeLinkFloat`).
- **Muda de cor** entre o ciano da AURA/ARGUS e o roxo da AURA
  (`psfhomeLinkColor`), reforçando visualmente que ele representa a
  ligação entre as duas personas.
- Brilho aplicado via `text-shadow` (que segue o formato do próprio
  caractere, não um retângulo/círculo de fundo).

## Arquivo alterado
- `app/globals.css` (`.psfhome-avatars-link-icon` e as duas novas
  animações)

## O que NÃO foi alterado
- A posição do símbolo (continua entre os dois cards, no grid corrigido
  do PATCH_112).
- Nenhuma outra página. Tema claro/escuro continua intocado.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Subir o arquivo.
2. Abrir a landing e confirmar que o símbolo entre AURA e ARGUS aparece
   sem nenhum fundo/círculo — só o ícone flutuando e mudando de cor —
   e que a chuva de binário continua visível por trás dele o tempo todo.

## Status
Implementado e validado por build.
