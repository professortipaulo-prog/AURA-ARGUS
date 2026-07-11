'use client';

import { useState } from 'react';
import type { HangmanGame } from '@/lib/study/generation';

const MAX_ERRORS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function HangmanGamePlayer({ game, onExit }: { game: HangmanGame; onExit: () => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  const current = game.words[wordIndex];
  const letters = current ? current.word.replace(/[^A-Z]/g, '').split('') : [];
  const wrongGuesses = current ? [...guessed].filter((letter) => !current.word.includes(letter)) : [];
  const errors = wrongGuesses.length;
  const isLost = errors >= MAX_ERRORS;
  const isWon = current ? letters.every((letter) => guessed.has(letter)) : false;
  const isOver = isLost || isWon;
  const isLastWord = wordIndex === game.words.length - 1;

  function guess(letter: string) {
    if (isOver || guessed.has(letter)) return;
    setGuessed((prev) => new Set(prev).add(letter));
  }

  function next() {
    if (isWon) setScore((s) => s + 1);
    if (isLastWord) {
      onExit();
      return;
    }
    setWordIndex((i) => i + 1);
    setGuessed(new Set());
  }

  if (!current) return null;

  return (
    <div className="aios-hangman-game">
      <div className="aios-quiz-header">
        <span>Palavra {wordIndex + 1} de {game.words.length}</span>
        <strong>Pontos: {score}</strong>
      </div>

      <p className="aios-hangman-hint">💡 Dica: {current.hint}</p>
      <p className="aios-hangman-errors">Erros: {errors} / {MAX_ERRORS}</p>

      <div className="aios-hangman-word">
        {current.word.split('').map((char, index) => (
          <span key={index} className="aios-hangman-letter">
            {char === ' ' ? '\u00A0\u00A0' : guessed.has(char) || isLost ? char : '_'}
          </span>
        ))}
      </div>

      {isOver ? (
        <div className="aios-game-result">
          <h3>{isWon ? '✅ Acertou!' : `❌ Não foi dessa vez — a palavra era "${current.word}"`}</h3>
          <button className="aios-primary-button" onClick={next}>{isLastWord ? 'Terminar' : 'Próxima palavra'}</button>
        </div>
      ) : (
        <div className="aios-hangman-keyboard">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              className={`aios-hangman-key ${guessed.has(letter) ? (current.word.includes(letter) ? 'correct' : 'wrong') : ''}`}
              onClick={() => guess(letter)}
              disabled={guessed.has(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
