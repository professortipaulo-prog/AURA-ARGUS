import { describe, it, expect } from 'vitest';
import { classifyExpression } from './expression';

describe('classifyExpression', () => {
  it('classifica incerteza/falta de informação como "serious"', () => {
    expect(classifyExpression('Não sei informar isso, preciso de mais informações sobre o projeto.')).toBe('serious');
    expect(classifyExpression('Infelizmente não encontrei nenhuma menção a isso nos seus arquivos.')).toBe('serious');
  });

  it('classifica conclusão/sucesso como "smiling"', () => {
    expect(classifyExpression('Perfeito! Documento gerado com sucesso, aqui está o link.')).toBe('smiling');
    expect(classifyExpression('Excelente, tudo certo com sua solicitação.')).toBe('smiling');
  });

  it('classifica respostas neutras como "talking"', () => {
    expect(classifyExpression('AURA online. Pronta para compreender, organizar e orientar.')).toBe('talking');
    expect(classifyExpression('O horário atual em Brasília é 22:40.')).toBe('talking');
  });
});
