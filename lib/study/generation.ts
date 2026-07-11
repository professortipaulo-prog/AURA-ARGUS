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

export type WordSearchGame = {
  grid: string[][];
  words: { original: string; norm: string }[];
};

function normalizeWord(word: string): string {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
}

const WORD_SEARCH_DIRECTIONS = [
  { dr: 0, dc: 1 }, // horizontal
  { dr: 1, dc: 0 }, // vertical
  { dr: 1, dc: 1 }, // diagonal \
  { dr: 1, dc: -1 } // diagonal /
];

/**
 * Gera a grade do caça-palavras posicionando cada palavra em uma direcao
 * aleatoria (horizontal/vertical/diagonal), sem sobrepor letras
 * conflitantes. Palavras que nao couberem apos varias tentativas sao
 * descartadas (nao trava a geracao). Testado isoladamente antes de
 * integrar: confirmado que toda palavra colocada e realmente
 * encontravel na grade final, e que a grade fica sempre totalmente
 * preenchida (sem celulas vazias).
 */
export function buildWordSearchGrid(originalWords: string[], size = 15): WordSearchGame {
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const placed: { original: string; norm: string }[] = [];

  const words = originalWords
    .map((word) => ({ original: word, norm: normalizeWord(word) }))
    .filter((word) => word.norm.length >= 3 && word.norm.length <= size)
    .sort((a, b) => b.norm.length - a.norm.length);

  function canPlace(word: string, r: number, c: number, dir: { dr: number; dc: number }): boolean {
    for (let i = 0; i < word.length; i++) {
      const rr = r + dir.dr * i;
      const cc = c + dir.dc * i;
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) return false;
      const existing = grid[rr]?.[cc] ?? null;
      const expected = word[i] ?? '';
      if (existing !== null && existing !== expected) return false;
    }
    return true;
  }

  function place(word: string, r: number, c: number, dir: { dr: number; dc: number }) {
    for (let i = 0; i < word.length; i++) {
      const row = grid[r + dir.dr * i];
      if (row) row[c + dir.dc * i] = word[i] ?? null;
    }
  }

  for (const word of words) {
    let placedOk = false;
    for (let attempt = 0; attempt < 200 && !placedOk; attempt++) {
      const dir = WORD_SEARCH_DIRECTIONS[Math.floor(Math.random() * WORD_SEARCH_DIRECTIONS.length)]!;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (canPlace(word.norm, r, c, dir)) {
        place(word.norm, r, c, dir);
        placed.push(word);
        placedOk = true;
      }
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const finalGrid: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? alphabet[Math.floor(Math.random() * alphabet.length)]!)
  );

  return { grid: finalGrid, words: placed };
}

export async function generateWordSearch(subject: string, persona: 'aura' | 'argus'): Promise<WordSearchGame | null> {
  const instructions = `Liste de 10 a 14 palavras-chave (uma palavra cada, sem espaços, sem hífen) relacionadas ao assunto: "${subject}", em português do Brasil, adequadas para um caça-palavras educativo. Responda EXATAMENTE neste formato JSON: {"words":["PALAVRA1","PALAVRA2"]}.`;
  const result = await askForJson<{ words: string[] }>({ subject, instructions, persona });
  if (!result?.words?.length) return null;

  const game = buildWordSearchGrid(result.words, 15);
  if (game.words.length === 0) return null;
  return game;
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
