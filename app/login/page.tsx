'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { normalizeLoginIdentifier } from '@/lib/auth/constants';
import { LivingBackground } from '@/components/living-background';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [faceEmail, setFaceEmail] = useState('');
  const [faceStatus, setFaceStatus] = useState<'idle' | 'loading-models' | 'camera-on' | 'verifying' | 'error'>('idle');
  const [faceError, setFaceError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const email = normalizeLoginIdentifier(identifier);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' ? 'E-mail/usuário ou senha inválidos.' : loginError.message);
      setIsLoading(false);
      return;
    }

    // Sessao unica: derruba qualquer outro dispositivo/navegador logado
    // nesta mesma conta, mantendo so a sessao que acabou de entrar.
    await supabase.auth.signOut({ scope: 'others' }).catch(() => undefined);

    await fetch('/api/auth/profile', { method: 'POST' }).catch(() => null);
    router.replace('/dashboard');
    router.refresh();
  }

  function stopFaceCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startFaceLogin() {
    if (!faceEmail.trim()) {
      setFaceError('Digite seu e-mail primeiro.');
      return;
    }
    setFaceError(null);
    setFaceStatus('loading-models');
    try {
      const faceapi = await import('face-api.js');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setFaceStatus('camera-on');
      // O <video> so existe no DOM depois do setStatus acima -- por isso
      // conectamos o stream logo em seguida, ja garantido que o elemento
      // foi montado (mesma correcao aplicada no PATCH_098).
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch (err) {
      setFaceError(err instanceof Error ? err.message : 'Não foi possível acessar a câmera.');
      setFaceStatus('error');
    }
  }

  async function captureAndVerify() {
    if (!videoRef.current) return;
    setFaceStatus('verifying');
    setFaceError(null);

    try {
      const faceapi = await import('face-api.js');
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceError('Nenhum rosto detectado. Aproxime-se da câmera e tente novamente.');
        setFaceStatus('camera-on');
        return;
      }

      const response = await fetch('/api/auth/face-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeLoginIdentifier(faceEmail), descriptor: Array.from(detection.descriptor) })
      });
      const data = await response.json();

      if (!data.ok) {
        setFaceError(data.error ?? 'Não foi possível entrar com reconhecimento facial. Use e-mail e senha.');
        setFaceStatus('camera-on');
        return;
      }

      stopFaceCamera();
      await fetch('/api/auth/profile', { method: 'POST' }).catch(() => null);
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setFaceError(err instanceof Error ? err.message : 'Erro ao verificar o rosto.');
      setFaceStatus('camera-on');
    }
  }

  return (
    <main className="aios-login-page">
      <LivingBackground persona="argus" />
      <section className="aios-login-card">
        <Link href="/" className="aios-login-brand">
          <span>⬡</span>
          <div><strong>AURA / ARGUS</strong><p>AI Operating System</p></div>
        </Link>
        <h1>Acesso seguro</h1>
        <p>Entre com suas credenciais para acessar o núcleo operacional AURA/ARGUS.</p>
        <form onSubmit={handleSubmit}>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" placeholder="E-mail ou usuário" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Senha" required />
          {error ? <div className="aios-login-error">{error}</div> : null}
          <button type="submit" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar no sistema'}</button>
        </form>

        <button type="button" className="aios-login-face-toggle" onClick={() => setShowFaceLogin((v) => !v)}>
          {showFaceLogin ? 'Ocultar entrada por reconhecimento facial' : '📷 Entrar com reconhecimento facial (opcional)'}
        </button>

        {showFaceLogin && (
          <div className="aios-login-face-panel">
            <p className="aios-login-face-hint">
              Só funciona se você já cadastrou seu rosto em Configurações. Se não funcionar, use e-mail e senha acima.
            </p>
            <input
              value={faceEmail}
              onChange={(e) => setFaceEmail(e.target.value)}
              placeholder="Seu e-mail cadastrado"
              disabled={faceStatus === 'camera-on' || faceStatus === 'verifying'}
            />

            {faceStatus === 'idle' || faceStatus === 'error' ? (
              <button type="button" onClick={startFaceLogin}>Ativar câmera</button>
            ) : null}

            {faceStatus === 'loading-models' && <p className="aios-login-face-hint">Carregando modelo...</p>}

            {(faceStatus === 'camera-on' || faceStatus === 'verifying') && (
              <>
                <p className="aios-login-face-hint">Posicione seu rosto dentro da área oval.</p>
                <div className="aios-face-video-wrap">
                  <video ref={videoRef} muted playsInline className="aios-face-video" />
                  <div className="aios-face-oval-guide" aria-hidden="true" />
                </div>
                <button type="button" onClick={captureAndVerify} disabled={faceStatus === 'verifying'}>
                  {faceStatus === 'verifying' ? 'Verificando...' : 'Verificar rosto e entrar'}
                </button>
                <button
                  type="button"
                  className="aios-login-face-cancel"
                  onClick={() => {
                    stopFaceCamera();
                    setFaceStatus('idle');
                  }}
                >
                  Cancelar
                </button>
              </>
            )}

            {faceError ? <div className="aios-login-error">{faceError}</div> : null}
          </div>
        )}
      </section>
    </main>
  );
}
