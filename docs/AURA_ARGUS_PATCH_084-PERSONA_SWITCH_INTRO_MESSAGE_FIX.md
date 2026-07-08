# AURA_ARGUS_PATCH_084 — PERSONA_SWITCH_INTRO_MESSAGE_FIX

## Objetivo
Corrigir bug reportado por Paulo: ao clicar em ARGUS (card fica "ATIVO"),
a conversa continuava mostrando a mensagem de apresentação da AURA — texto
e botão de áudio incluídos — como se a troca de persona não tivesse
acontecido de verdade na conversa visível.

## Causa raiz
O estado inicial de mensagens (`useState<ChatMessage[]>`) sempre começava
com **apenas** a mensagem de introdução da AURA, fixa:
```
{ role: 'assistant', content: PERSONAS.aura.intro, persona: 'aura', ... }
```
E `switchPersona()` só trocava o estado da persona ativa (cor do card,
placeholder do campo de texto) — **nunca adicionava uma mensagem nova**
na conversa para apresentar a persona recém-selecionada. Então, se o
usuário trocasse para ARGUS antes de mandar qualquer mensagem real, a
única coisa na tela continuava sendo a intro da AURA, com `persona: 'aura'`
— por isso o botão de ouvir daquela mensagem específica tocava com a voz
da AURA (tecnicamente correto para aquela mensagem antiga, mas confuso, já
que nada avisava que a AURA "saiu" e o ARGUS "entrou").

## Correção aplicada
`switchPersona()` agora, sempre que a persona realmente muda (não apenas
re-clicar na mesma já ativa), adiciona uma nova mensagem de assistente com
a introdução da persona recém-selecionada:
```js
if (next !== persona) {
  setMessages((prev) => [...prev, {
    role: 'assistant',
    content: PERSONAS[next].intro,
    persona: next,
    time: now(),
    meta: PERSONAS[next].meta
  }]);
}
```

Efeito colateral bom, não um bug: como essa nova mensagem passa a ser a
última do array, o `useEffect` de áudio automático (PATCH_074) já
existente a detecta e a persona recém-selecionada **se apresenta em voz
alta** ao entrar — reforça a sensação de troca real de assistente.

## Arquivos alterados
- `app/dashboard/chat/page.tsx` (única alteração: `switchPersona`)

## O que NÃO foi alterado
- CSS, layout, outras páginas.
- A lógica de voz/diferenciação de tom por persona (patches 072-074) —
  reaproveitada sem alteração.

## Validação executada
```
npm run typecheck   # 0 erros
npm run build         # build completo
```

## Teste funcional recomendado
1. Abrir o Chat IA pela primeira vez na sessão (só a intro da AURA na
   tela).
2. Clicar no card do ARGUS **sem mandar nenhuma mensagem antes**.
3. Confirmar que aparece uma nova mensagem "ARGUS — [intro do ARGUS]" na
   conversa, e que o áudio automático (se ligado) fala essa introdução
   com o tom do ARGUS, não da AURA.
4. Clicar de volta em AURA e confirmar o mesmo, na direção contrária.

## Status
Implementado e validado nesta sessão, em resposta direta ao bug
reportado por Paulo.
