/**
 * modules/voice/index.ts
 * Status: parcialmente implementado (PATCH_071). A captura de fala
 * (SpeechRecognition) e a leitura em voz alta (SpeechSynthesis) já
 * funcionam de verdade, embutidas diretamente em app/dashboard/chat/page.tsx
 * — ainda não extraídas para um serviço isolado deste módulo. Depende do
 * navegador suportar a Web Speech API (Chrome/Edge; sem suporte completo
 * no Firefox/Safari) — o botão de microfone e o de ouvir só aparecem
 * quando o navegador suporta.
 */
export const MODULE_STATUS = 'partial' as const;
