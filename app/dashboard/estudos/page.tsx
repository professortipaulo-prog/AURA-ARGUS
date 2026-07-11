'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { QuizGamePlayer } from '@/components/study/quiz-game';
import { HangmanGamePlayer } from '@/components/study/hangman-game';
import { WordSearchGamePlayer } from '@/components/study/wordsearch-game';
import type { QuizGame, HangmanGame, WordSearchGame } from '@/lib/study/generation';

type Mode = 'idle' | 'summary' | 'game-select' | 'quiz' | 'hangman' | 'wordsearch';

export default function EstudosPage() {
  const [subject, setSubject] = useState('');
  const [persona, setPersona] = useState<'aura' | 'argus'>('aura');
  const [mode, setMode] = useState<Mode>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizGame | null>(null);
  const [hangman, setHangman] = useState<HangmanGame | null>(null);
  const [wordsearch, setWordsearch] = useState<WordSearchGame | null>(null);

  function requireSubject(): boolean {
    if (!subject.trim()) {
      setError('Diz pra mim o que você está estudando agora (ex: "História — Inconfidência Mineira").');
      return false;
    }
    setError(null);
    return true;
  }

  async function handleFocus() {
    if (!requireSubject()) return;
    setLoading(true);
    setMode('summary');
    setSummary(null);
    try {
      const response = await fetch('/api/study/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, persona })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? 'Não consegui gerar o resumo agora.');
        setMode('idle');
        return;
      }
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartQuiz() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, persona })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? 'Não consegui montar o quiz agora.');
        return;
      }
      setQuiz(data.quiz);
      setMode('quiz');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartHangman() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/study/hangman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, persona })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? 'Não consegui montar o jogo agora.');
        return;
      }
      setHangman(data.game);
      setMode('hangman');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartWordSearch() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/study/wordsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, persona })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? 'Não consegui montar o caça-palavras agora.');
        return;
      }
      setWordsearch(data.game);
      setMode('wordsearch');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Central de Estudos" subtitle="Foco, resumos e jogos sobre o que você está estudando." />
      <section className="p-5 lg:p-8 grid gap-6">
        <div className="aios-panel">
          <div className="aios-action-title-row">
            <div>
              <p className="aios-kicker">O QUE VOCÊ ESTÁ ESTUDANDO AGORA?</p>
              <h2>Assunto</h2>
              <p className="aios-muted">
                Descreva a matéria e o tópico (ex: "História — Inconfidência Mineira"). Se você já subiu material sobre
                isso em Documentos, ele será usado automaticamente.
              </p>
            </div>
          </div>

          <label className="aios-form-control">
            <span>Matéria / tópico</span>
            <input
              className="aios-input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Ex: História — Inconfidência Mineira"
            />
          </label>

          <div className="aios-avatar-toggle" style={{ marginBottom: 16 }}>
            <button type="button" className={persona === 'aura' ? 'is-active' : ''} onClick={() => setPersona('aura')}>AURA</button>
            <button type="button" className={persona === 'argus' ? 'is-active' : ''} onClick={() => setPersona('argus')}>ARGUS</button>
          </div>

          <div className="aios-action-bar">
            <button className="aios-primary-button" onClick={handleFocus} disabled={loading}>
              🎯 Botão de Foco (resumo)
            </button>
            <button
              className="aios-secondary-button"
              onClick={() => {
                if (requireSubject()) setMode('game-select');
              }}
              disabled={loading}
            >
              🎮 Botão de Gamificação
            </button>
          </div>

          {error && (
            <div className="aios-action-result error" style={{ marginTop: 14 }}>
              <p>{error}</p>
            </div>
          )}
        </div>

        {loading && <p className="aios-muted">Gerando com {persona === 'argus' ? 'ARGUS' : 'AURA'}...</p>}

        {mode === 'summary' && summary && (
          <div className="aios-panel">
            <h2>Resumo — {subject}</h2>
            <div className="aios-study-summary" style={{ whiteSpace: 'pre-wrap' }}>{summary}</div>
          </div>
        )}

        {mode === 'game-select' && (
          <div className="aios-panel">
            <h2>Escolha o jogo</h2>
            <p className="aios-muted">Sobre: {subject}</p>
            <div className="aios-action-bar" style={{ marginTop: 14 }}>
              <button className="aios-primary-button" onClick={handleStartQuiz} disabled={loading}>💰 Jogo do Milhão</button>
              <button className="aios-primary-button" onClick={handleStartHangman} disabled={loading}>🪢 Forca</button>
              <button className="aios-primary-button" onClick={handleStartWordSearch} disabled={loading}>🔎 Caça-palavras</button>
            </div>
            <p className="aios-muted" style={{ marginTop: 14 }}>Palavras cruzadas chega em breve.</p>
          </div>
        )}

        {mode === 'quiz' && quiz && (
          <div className="aios-panel">
            <QuizGamePlayer quiz={quiz} onExit={() => setMode('game-select')} />
          </div>
        )}

        {mode === 'hangman' && hangman && (
          <div className="aios-panel">
            <HangmanGamePlayer game={hangman} onExit={() => setMode('game-select')} />
          </div>
        )}

        {mode === 'wordsearch' && wordsearch && (
          <div className="aios-panel">
            <WordSearchGamePlayer game={wordsearch} onExit={() => setMode('game-select')} />
          </div>
        )}
      </section>
    </>
  );
}
