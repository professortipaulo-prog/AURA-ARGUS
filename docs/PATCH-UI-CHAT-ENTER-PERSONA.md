# PATCH UI — Chat, Header e Persona

## Alterações

- Remove os botões `Abrir chat` e `Entrar` do Header interno do dashboard.
- Mantém apenas o seletor de tema no Header.
- Permite enviar mensagem no chat com `Enter`.
- `Shift + Enter` continua quebrando linha.
- Envia `persona` explícita (`aura` ou `argus`) para `/api/ai/chat`.
- A API aplica prompt base obrigatório para AURA ou ARGUS.
- Evita respostas como "sou Gemini" ou "sou Claude" quando o usuário está falando com AURA/ARGUS.
- Mantém uso do perfil inteligente quando disponível.

## Observação

O domínio canônico informado para produção é:

```text
https://aura-argus.vercel.app/
```
