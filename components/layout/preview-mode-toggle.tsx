'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PreviewModeToggle({ previewType }: { previewType: 'estudantil' | 'worker' | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setType(type: 'estudantil' | 'worker' | null) {
    setLoading(true);
    try {
      await fetch('/api/admin/preview-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aios-preview-toggle">
      <span>Testar como:</span>
      <div className="aios-preview-toggle-buttons">
        <button type="button" className={!previewType ? 'is-active' : ''} disabled={loading} onClick={() => setType(null)}>
          Eu (owner)
        </button>
        <button type="button" className={previewType === 'estudantil' ? 'is-active' : ''} disabled={loading} onClick={() => setType('estudantil')}>
          Estudantil
        </button>
        <button type="button" className={previewType === 'worker' ? 'is-active' : ''} disabled={loading} onClick={() => setType('worker')}>
          Worker
        </button>
      </div>
    </div>
  );
}
