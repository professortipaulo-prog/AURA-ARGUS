import { describe, it, expect } from 'vitest';
import { extractMemoryCandidate } from './server';

describe('extractMemoryCandidate — regressão do bug histórico (PATCH_066)', () => {
  it('extrai a cor favorita mesmo quando a frase termina com ponto final', () => {
    const result = extractMemoryCandidate('Gosto de azul.');
    expect(result).not.toBeNull();
    expect(result?.content).toContain('azul');
  });

  it('extrai a cor favorita com "minha cor favorita é"', () => {
    const result = extractMemoryCandidate('Minha cor favorita é verde.');
    expect(result?.content).toContain('verde');
  });

  it('extrai preferência com "prefiro"', () => {
    const result = extractMemoryCandidate('Prefiro a cor roxo!');
    expect(result?.content).toContain('roxo');
  });

  it('não gera candidato para mensagens sem preferência nenhuma', () => {
    const result = extractMemoryCandidate('Qual o horário agora?');
    expect(result).toBeNull();
  });
});
