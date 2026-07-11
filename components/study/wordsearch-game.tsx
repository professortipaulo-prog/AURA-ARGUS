'use client';

import { useMemo, useRef, useState } from 'react';
import type { WordSearchGame } from '@/lib/study/generation';

type Cell = { r: number; c: number };

function cellsBetween(sr: number, sc: number, er: number, ec: number): Cell[] | null {
  if (sr !== er && sc !== ec && Math.abs(er - sr) !== Math.abs(ec - sc)) return null;
  const dr = Math.sign(er - sr);
  const dc = Math.sign(ec - sc);
  const len = Math.max(Math.abs(er - sr), Math.abs(ec - sc)) + 1;
  const cells: Cell[] = [];
  for (let i = 0; i < len; i++) cells.push({ r: sr + dr * i, c: sc + dc * i });
  return cells;
}

export function WordSearchGamePlayer({ game, onExit }: { game: WordSearchGame; onExit: () => void }) {
  const [preview, setPreview] = useState<Cell[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<number>>(new Set());
  const startRef = useRef<Cell | null>(null);
  const draggingRef = useRef(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const size = game.grid.length;
  const previewKeys = useMemo(() => new Set(preview.map((p) => `${p.r}-${p.c}`)), [preview]);
  const won = foundWords.size === game.words.length && game.words.length > 0;

  function matchWord(cells: Cell[]): number {
    const forward = cells.map((p) => game.grid[p.r]?.[p.c] ?? '').join('');
    const backward = [...forward].reverse().join('');
    for (let i = 0; i < game.words.length; i++) {
      if (foundWords.has(i)) continue;
      const norm = game.words[i]?.norm;
      if (norm === forward || norm === backward) return i;
    }
    return -1;
  }

  function cellFromPoint(x: number, y: number): Cell | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const r = el?.dataset?.r;
    const c = el?.dataset?.c;
    if (r === undefined || c === undefined) return null;
    return { r: Number(r), c: Number(c) };
  }

  function finalize(cells: Cell[]) {
    setPreview([]);
    const idx = matchWord(cells);
    if (idx >= 0) {
      setFoundWords((prev) => new Set(prev).add(idx));
      setFoundCells((prev) => {
        const next = new Set(prev);
        cells.forEach((p) => next.add(`${p.r}-${p.c}`));
        return next;
      });
    }
  }

  function handleStart(cell: Cell) {
    draggingRef.current = true;
    startRef.current = cell;
  }

  function handleMove(cell: Cell | null) {
    if (!draggingRef.current || !startRef.current || !cell) return;
    const cells = cellsBetween(startRef.current.r, startRef.current.c, cell.r, cell.c);
    if (cells) setPreview(cells);
  }

  function handleEnd(cell: Cell | null) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (cell && startRef.current) {
      const cells = cellsBetween(startRef.current.r, startRef.current.c, cell.r, cell.c);
      if (cells) finalize(cells);
      else setPreview([]);
    } else {
      setPreview([]);
    }
    startRef.current = null;
  }

  return (
    <div className="aios-wordsearch-game">
      <div className="aios-quiz-header">
        <span>Encontre as {game.words.length} palavras escondidas</span>
        <strong>{foundWords.size} / {game.words.length}</strong>
      </div>

      <div
        ref={boardRef}
        className="aios-wordsearch-board"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        onMouseUp={() => handleEnd(null)}
        onMouseLeave={() => draggingRef.current && setPreview([])}
        onTouchMove={(event) => {
          const t = event.touches[0];
          if (t) handleMove(cellFromPoint(t.clientX, t.clientY));
        }}
        onTouchEnd={(event) => {
          const t = event.changedTouches[0];
          if (t) handleEnd(cellFromPoint(t.clientX, t.clientY));
        }}
      >
        {game.grid.map((row, r) =>
          row.map((letter, c) => {
            const key = `${r}-${c}`;
            const isFound = foundCells.has(key);
            const isPreview = previewKeys.has(key);
            return (
              <div
                key={key}
                data-r={r}
                data-c={c}
                className={`aios-wordsearch-cell ${isFound ? 'found' : ''} ${isPreview ? 'preview' : ''}`}
                onMouseDown={() => handleStart({ r, c })}
                onMouseEnter={() => handleMove({ r, c })}
                onMouseUp={() => handleEnd({ r, c })}
                onTouchStart={() => handleStart({ r, c })}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      <ul className="aios-wordsearch-list">
        {game.words.map((word, index) => (
          <li key={index} className={foundWords.has(index) ? 'found' : ''}>{word.original}</li>
        ))}
      </ul>

      {won && (
        <div className="aios-game-result">
          <h3>🎉 Parabéns! Você encontrou todas as palavras!</h3>
          <button className="aios-primary-button" onClick={onExit}>Jogar de novo</button>
        </div>
      )}

      {!won && (
        <div className="aios-action-bar" style={{ marginTop: 14 }}>
          <button className="aios-secondary-button" onClick={onExit}>Voltar</button>
        </div>
      )}
    </div>
  );
}
