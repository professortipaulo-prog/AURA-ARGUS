'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aura-argus-mode';
type PersonaTheme = 'aura' | 'argus';

function apply(mode: PersonaTheme) {
  document.documentElement.dataset.assistantTheme = mode;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<PersonaTheme>('argus');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as PersonaTheme | null;
    const initial = stored === 'aura' || stored === 'argus' ? stored : 'argus';
    setMode(initial);
    apply(initial);
  }, []);

  function toggle() {
    const next = mode === 'argus' ? 'aura' : 'argus';
    setMode(next);
    apply(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button type="button" onClick={toggle} className="aios-theme-button" aria-label="Alternar tema AURA/ARGUS" title="Alternar tema AURA/ARGUS">
      {mode === 'argus' ? '✦' : '◐'}
    </button>
  );
}
