# Módulo: voice

**Status: parcialmente implementado (PATCH_071).**

A Web Speech API (nativa do navegador, sem credencial/OAuth) já está
funcionando dentro do Chat IA (`app/dashboard/chat/page.tsx`):
- Botão de microfone (🎙) transcreve fala em texto (SpeechRecognition).
- Botão de ouvir (🔊) em cada resposta lê o texto em voz alta
  (SpeechSynthesis).
- Ambos os botões só aparecem se o navegador suportar a API (detecção
  em tempo de execução) — sem suporte, a interface simplesmente não
  mostra os botões, sem quebrar nada.

Pendente para uma próxima etapa: extrair essa lógica para um serviço
isolado deste módulo (`modules/voice`), em vez de viver embutida
diretamente na página do chat; e avaliar "palavra de ativação"
(escuta contínua), que exige mais cuidado com privacidade/consumo de
bateria e não foi implementada.
