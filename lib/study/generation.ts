import { sendChat } from '@/lib/ai/ai-router';
import { buildPersonaSystemPrompt } from '@/lib/identity/prompt-builder';
import { getCurrentUserIdentity } from '@/lib/identity/server';
import { getKnowledgeContext } from '@/lib/knowledge/server';

export function extractJson<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json\s*|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

async function askForJson<T>(params: { subject: string; instructions: string; persona: 'aura' | 'argus' }): Promise<T | null> {
  const { user, identity } = await getCurrentUserIdentity();
  const knowledgeContext = user?.id ? await getKnowledgeContext(user.id, params.subject) : null;

  const systemPrompt = buildPersonaSystemPrompt({
    persona: params.persona,
    identity,
    memoryPrompt: knowledgeContext ?? '',
    extraSystemPrompt: 'Responda APENAS com um JSON valido, sem nenhum texto antes ou depois, sem markdown, sem crases. Se o assunto pedido tiver material enviado pelo usuario (base de conhecimento), baseie o conteudo nesse material real. Se nao houver material especifico, use conhecimento geral confiavel sobre o assunto.'
  });

  const result = await sendChat({ message: params.instructions, persona: params.persona, systemPrompt });
  return extractJson<T>(result.response);
}

export type QuizQuestion = { question: string; options: string[]; correctIndex: number; prizeLabel: string };
export type QuizGame = { questions: QuizQuestion[] };

export async function generateQuiz(subject: string, persona: 'aura' | 'argus'): Promise<QuizGame | null> {
  const prizes = ['R$ 1.000', 'R$ 2.000', 'R$ 5.000', 'R$ 10.000', 'R$ 20.000', 'R$ 50.000', 'R$ 100.000', 'R$ 250.000', 'R$ 500.000', 'R$ 1.000.000'];
  const instructions = `Crie um quiz de múltipla escolha estilo "Show do Milhão" sobre o assunto: "${subject}". Português do Brasil. 10 perguntas, dificuldade crescente da 1ª à 10ª. Cada pergunta com exatamente 4 opções (só uma correta). Responda EXATAMENTE neste formato JSON: {"questions":[{"question":"texto da pergunta","options":["op1","op2","op3","op4"],"correctIndex":0,"prizeLabel":"${prizes[0]}"}]} — repita a estrutura para as 10 perguntas, usando os valores de prêmio em ordem crescente: ${prizes.join(', ')}.`;
  return askForJson<QuizGame>({ subject, instructions, persona });
}

export type HangmanWord = { word: string; hint: string };
export type HangmanGame = { words: HangmanWord[] };

export async function generateHangman(subject: string, persona: 'aura' | 'argus'): Promise<HangmanGame | null> {
  const instructions = `Crie uma lista de 5 palavras ou expressões curtas (sem espaços seria ideal, mas expressões de até 3 palavras são aceitáveis) relacionadas ao assunto: "${subject}", em português do Brasil, para um jogo da forca educativo. Cada palavra deve vir SEM acentos e em maiúsculas no campo "word" (para facilitar o jogo), e ter uma dica clara no campo "hint" (essa pode ter acentos normalmente). Responda EXATAMENTE neste formato JSON: {"words":[{"word":"PALAVRA","hint":"dica sobre o que é isso"}]} com 5 itens.`;
  const result = await askForJson<HangmanGame>({ subject, instructions, persona });
  if (!result) return null;
  result.words = result.words.map((w) => ({
    word: w.word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim(),
    hint: w.hint
  }));
  return result;
}

export async function generateStudySummary(subject: string, persona: 'aura' | 'argus'): Promise<string> {
  const { user, identity } = await getCurrentUserIdentity();
  const knowledgeContext = user?.id ? await getKnowledgeContext(user.id, subject) : null;

  const systemPrompt = buildPersonaSystemPrompt({
    persona,
    identity,
    memoryPrompt: knowledgeContext ?? '',
    extraSystemPrompt: 'Você está gerando um resumo de estudo, no estilo do NotebookLM: organizado, com títulos e subtítulos claros, tópicos objetivos (não parágrafos longos), destacando datas/nomes/conceitos-chave quando existirem, e terminando com uma seção "Perguntas para revisar" (3 a 5 perguntas que ajudam o aluno a testar se aprendeu). Se houver material enviado pelo usuário sobre o assunto, baseie o resumo nesse material real, citando de qual arquivo veio quando fizer sentido. Responda em português do Brasil.'
  });

  const message = `Faça um resumo de estudo completo e bem organizado sobre: "${subject}".`;
  const result = await sendChat({ message, persona, systemPrompt });
  return result.response;
}
