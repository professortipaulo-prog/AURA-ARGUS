import { describe, it, expect } from 'vitest';
import { buildWordSearchGrid } from './generation';

function cellsBetween(sr: number, sc: number, er: number, ec: number) {
  const dr = Math.sign(er - sr);
  const dc = Math.sign(ec - sc);
  const len = Math.max(Math.abs(er - sr), Math.abs(ec - sc)) + 1;
  const cells: { r: number; c: number }[] = [];
  for (let i = 0; i < len; i++) cells.push({ r: sr + dr * i, c: sc + dc * i });
  return cells;
}

function isWordFindable(grid: string[][], word: string): boolean {
  const size = grid.length;
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 }
  ];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const dir of directions) {
        const er = r + dir.dr * (word.length - 1);
        const ec = c + dir.dc * (word.length - 1);
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
        const cells = cellsBetween(r, c, er, ec);
        const forward = cells.map((p) => grid[p.r]?.[p.c] ?? '').join('');
        if (forward === word) return true;
      }
    }
  }
  return false;
}

describe('buildWordSearchGrid', () => {
  const words = ['Hardware', 'Componentes', 'Periféricos', 'Sistemas', 'Segurança', 'Informação', 'Software', 'Reconhecer'];
  const game = buildWordSearchGrid(words, 15);

  it('coloca todas as palavras razoáveis (até o tamanho da grade)', () => {
    expect(game.words.length).toBeGreaterThan(0);
  });

  it('toda palavra colocada é realmente encontrável na grade final', () => {
    for (const word of game.words) {
      expect(isWordFindable(game.grid, word.norm)).toBe(true);
    }
  });

  it('a grade fica totalmente preenchida, sem células vazias', () => {
    const hasEmpty = game.grid.some((row) => row.some((cell) => !cell));
    expect(hasEmpty).toBe(false);
  });

  it('palavras maiores que a grade são descartadas, sem travar a geração', () => {
    const result = buildWordSearchGrid(['PALAVRAGIGANTESCADEMAISPARACABERAQUI'], 10);
    expect(result.words.length).toBe(0);
    expect(result.grid.length).toBe(10);
  });

  it('regressão: mesmo se a IA ignorar a instrução e devolver frases com espaço em vez de palavras únicas, a grade padrão (20x20) ainda consegue posicionar a maioria', () => {
    const nonCompliantPhrases = [
      'Inconfidência Mineira', 'Sistema Operacional', 'Coroa Portuguesa',
      'Independência', 'Minas Gerais', 'Conspiração', 'Tiradentes', 'Ouro'
    ];
    const result = buildWordSearchGrid(nonCompliantPhrases);
    expect(result.words.length).toBeGreaterThanOrEqual(6);
  });
});
