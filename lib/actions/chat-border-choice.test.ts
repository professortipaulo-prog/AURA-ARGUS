import { describe, it, expect } from 'vitest';
import { detectBorderChoiceInMessage } from './chat-border-choice';

describe('detectBorderChoiceInMessage', () => {
  it('reconhece as bordas da AURA pelo nome', () => {
    expect(detectBorderChoiceInMessage('quero a floral', 'aura')).toBe(2);
    expect(detectBorderChoiceInMessage('ondas por favor', 'aura')).toBe(1);
  });

  it('reconhece as bordas do ARGUS pelo nome', () => {
    expect(detectBorderChoiceInMessage('hexagonal', 'argus')).toBe(2);
    expect(detectBorderChoiceInMessage('circuito', 'argus')).toBe(1);
  });

  it('reconhece resposta só com o número', () => {
    expect(detectBorderChoiceInMessage('2', 'aura')).toBe(2);
    expect(detectBorderChoiceInMessage('1', 'argus')).toBe(1);
  });

  it('retorna null para mensagem sem relação com borda', () => {
    expect(detectBorderChoiceInMessage('crie um documento sobre historia', 'aura')).toBeNull();
  });
});
