'use client';

/**
 * components/theme-toggle.tsx
 * Botão de tema claro/escuro (item obrigatório da tarefa inicial).
 *
 * A troca funciona alternando a classe `theme-light` em <html> e
 * persistindo a preferência em localStorage. As variáveis de cor base
 * (--bg, --panel, --text, etc. em app/globals.css) respondem à troca
 * imediatamente.
 *
 * Nota (ver README > Pendências Técnicas): os componentes visuais da
 * Sprint 005 (`components/ui/*`, sidebar, header) usam classes Tailwind
 * fixas (ex: `text-white`, `bg-slate-950/70`) em vez das variáveis de
 * tema. Isso significa que o "casco" da aplicação (fundo, cards com
 * `.aura-card`) já responde ao tema, mas uma repintura completa de
 * todos os componentes para o tema claro é um trabalho futuro, fora do
 * escopo desta tarefa.
 */
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aura-argus-theme';
type ThemeMode = 'dark' | 'light';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('theme-light', mode === 'light');
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial = stored ?? 'dark';
    setMode(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  // Evita flash de conteúdo incorreto antes da leitura do localStorage.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Alternar tema claro/escuro"
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300"
      >
        •
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema claro/escuro"
      title={mode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      {mode === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
