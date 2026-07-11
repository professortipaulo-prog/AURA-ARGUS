'use client';

import { useEffect, useState } from 'react';

export function MusicPreferencePanel() {
  const [musicUrl, setMusicUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile/preferences')
      .then((res) => res.json())
      .then((data) => setMusicUrl(data.musicUrl ?? ''))
      .catch(() => undefined);
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicUrl })
      });
      const data = await response.json();
      setMessage(data.ok ? 'Salvo — o botão 🎵 no Chat já vai usar esse link.' : data.error ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="aios-panel">
      <div className="aios-action-title-row">
        <div>
          <p className="aios-kicker">BOTÃO DE DESESTRESSE 🎵</p>
          <h2>Sua música/rádio favorita</h2>
          <p className="aios-muted">
            Cole aqui o link da sua playlist favorita (Spotify, YouTube Music, etc.) ou de uma rádio online. O botão 🎵
            no Chat vai abrir esse link numa nova aba, sempre que você precisar de uma pausa.
          </p>
        </div>
      </div>

      <label className="aios-form-control">
        <span>Link (precisa começar com https://)</span>
        <input
          className="aios-input"
          value={musicUrl}
          onChange={(event) => setMusicUrl(event.target.value)}
          placeholder="Ex: https://kissfm.com.br/aovivo/"
        />
      </label>

      <div className="aios-action-bar">
        <button className="aios-primary-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {message && <p className="aios-muted" style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}
