'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aura-argus-theme';
const ASSISTANT_KEY = 'aura-argus-assistant-mode';
type ThemeMode = 'dark' | 'light';
type AssistantMode = 'aura' | 'argus';

function applyMode(theme: ThemeMode, assistant?: AssistantMode) {
  const root = document.documentElement;
  const mode = assistant ?? (theme === 'light' ? 'aura' : 'argus');
  root.classList.toggle('theme-light', theme === 'light');
  root.dataset.assistant = mode;
  window.localStorage.setItem(ASSISTANT_KEY, mode);
  window.dispatchEvent(new CustomEvent('aura-argus-assistant-mode', { detail: mode }));
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const storedAssistant = window.localStorage.getItem(ASSISTANT_KEY) as AssistantMode | null;
    const initial = stored ?? (storedAssistant === 'aura' ? 'light' : 'dark');
    setMode(initial);
    applyMode(initial, storedAssistant ?? undefined);
    setMounted(true);
  }, []);

  function toggle() {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyMode(next, next === 'light' ? 'aura' : 'argus');
  }

  if (!mounted) {
    return (
      <button type="button" aria-label="Alternar tema" className="living-theme-toggle">
        •
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema AURA/ARGUS"
      title={mode === 'dark' ? 'Alternar para AURA' : 'Alternar para ARGUS'}
      className="living-theme-toggle"
    >
      {mode === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
