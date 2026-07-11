import { describe, it, expect } from 'vitest';
import { extractJson } from './generation';

describe('extractJson', () => {
  it('extrai JSON puro', () => {
    const raw = '{"questions":[{"question":"teste","options":["a","b","c","d"],"correctIndex":0,"prizeLabel":"R$ 1.000"}]}';
    expect(extractJson<{ questions: unknown[] }>(raw)?.questions.length).toBe(1);
  });

  it('extrai JSON envolvido em crases de markdown', () => {
    const raw = '```json\n{"words":[{"word":"TESTE","hint":"dica"}]}\n```';
    expect(extractJson<{ words: unknown[] }>(raw)?.words.length).toBe(1);
  });

  it('extrai JSON mesmo com texto antes e depois', () => {
    const raw = 'Aqui está:\n\n```json\n{"words":[{"word":"TESTE","hint":"dica"}]}\n```\n\nEspero que ajude!';
    expect(extractJson<{ words: unknown[] }>(raw)?.words.length).toBe(1);
  });

  it('retorna null para conteúdo inválido', () => {
    expect(extractJson('isso nao eh json valido {{{')).toBeNull();
  });
});
