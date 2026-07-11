'use client';

import { useState } from 'react';
import type { QuizGame } from '@/lib/study/generation';

export function QuizGamePlayer({ quiz, onExit }: { quiz: QuizGame; onExit: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [gameOver, setGameOver] = useState<'won' | 'lost' | null>(null);

  const current = quiz.questions[currentIndex];
  const prizeWon = currentIndex > 0 ? (quiz.questions[currentIndex - 1]?.prizeLabel ?? 'R$ 0') : 'R$ 0';

  function pickOption(index: number) {
    if (revealed || !current) return;
    setSelected(index);
    setRevealed(true);

    const correct = index === current.correctIndex;
    setTimeout(() => {
      if (!correct) {
        setGameOver('lost');
        return;
      }
      if (currentIndex === quiz.questions.length - 1) {
        setGameOver('won');
        return;
      }
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }, 1600);
  }

  if (gameOver) {
    return (
      <div className="aios-game-result">
        <h3>{gameOver === 'won' ? '🏆 Você ganhou o prêmio máximo!' : '❌ Fim de jogo'}</h3>
        <p>{gameOver === 'won' ? `Parabéns! Você acertou tudo e levou ${current?.prizeLabel}.` : `Você parou com ${prizeWon} no bolso — a resposta certa era: "${current?.options[current.correctIndex]}".`}</p>
        <button className="aios-primary-button" onClick={onExit}>Jogar de novo</button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="aios-quiz-game">
      <div className="aios-quiz-header">
        <span>Pergunta {currentIndex + 1} de {quiz.questions.length}</span>
        <strong>{current.prizeLabel}</strong>
      </div>
      <p className="aios-quiz-question">{current.question}</p>
      <div className="aios-quiz-options">
        {current.options.map((option, index) => {
          let state = '';
          if (revealed) {
            if (index === current.correctIndex) state = 'correct';
            else if (index === selected) state = 'wrong';
          }
          return (
            <button
              key={index}
              className={`aios-quiz-option ${state}`}
              onClick={() => pickOption(index)}
              disabled={revealed}
            >
              {String.fromCharCode(65 + index)}) {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
