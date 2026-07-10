import { describe, it, expect } from 'vitest';
import { euclideanDistance } from './server';

describe('euclideanDistance (comparação de rosto)', () => {
  it('retorna distância baixa para vetores praticamente iguais (mesmo rosto)', () => {
    const a = [0.1, 0.2, 0.3];
    const b = [0.11, 0.19, 0.31];
    expect(euclideanDistance(a, b)).toBeLessThan(0.1);
  });

  it('retorna distância alta para vetores bem diferentes (pessoa diferente)', () => {
    const a = [0.1, 0.1, 0.1];
    const b = [0.9, 0.9, 0.9];
    expect(euclideanDistance(a, b)).toBeGreaterThan(1);
  });

  it('retorna zero para vetores idênticos', () => {
    const a = [0.5, 0.5, 0.5];
    expect(euclideanDistance(a, a)).toBe(0);
  });
});
