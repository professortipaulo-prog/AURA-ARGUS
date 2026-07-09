# AURA_ARGUS_PATCH_097 — DASHBOARD_AVATAR_PERSONA_SWITCHER

## Objetivo
Corrigir: a Central de Operações (`/dashboard`) só mostrava a AURA,
nunca o ARGUS — a persona estava fixa no código (`persona="aura"`,
hardcoded), sem nenhuma forma de trocar.

## Causa
`app/dashboard/page.tsx` renderizava `<AvatarPanel persona="aura" ...>`
diretamente, sem nenhum estado ou controle — diferente do Chat IA, que já
tinha os dois avatares lado a lado e clicáveis desde o início.

## Correção aplicada
Novo componente cliente `DashboardAvatarSwitcher`, com um alternador
simples (2 botões, "AURA" / "ARGUS") acima do card de avatar — clicar
troca qual persona aparece, reaproveitando o `AvatarPanel` já existente
sem duplicar lógica.

## Arquivos alterados/novos
- `components/dashboard-avatar-switcher.tsx` (novo)
- `app/dashboard/page.tsx` (troca do `AvatarPanel` fixo pelo switcher)
- `app/globals.css` (estilo do alternador, aditivo)

## O que NÃO foi alterado
- `components/avatar-panel.tsx` em si — reaproveitado sem alteração.
- Nenhuma outra página, nenhum outro componente.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Abrir Central de Operações.
2. Confirmar que aparecem 2 botões pequenos ("AURA" / "ARGUS") acima do
   avatar.
3. Clicar em "ARGUS" e confirmar que o avatar muda para o ARGUS.
4. Clicar de volta em "AURA".

## Status
Implementado e validado por build.
