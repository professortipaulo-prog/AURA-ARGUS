'use client';

import { useEffect, useRef, useState } from 'react';

const CHECK_INTERVAL_MS = 4 * 60 * 1000; // a cada 4 minutos

export function FaceGuard({ children }: { children: React.ReactNode }) {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modelsLoadedRef = useRef(false);

  useEffect(() => {
    fetch('/api/face/enroll')
      .then((res) => res.json())
      .then((data) => setEnrolled(Boolean(data?.enrolled)))
      .catch(() => setEnrolled(false));
  }, []);

  useEffect(() => {
    if (!enrolled) return;

    let cancelled = false;

    async function setup() {
      try {
        const faceapi = await import('face-api.js');
        if (!modelsLoadedRef.current) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models')
          ]);
          modelsLoadedRef.current = true;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        async function runCheck() {
          if (!videoRef.current) return;
          try {
            const detection = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            const response = await fetch('/api/face/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ descriptor: detection ? Array.from(detection.descriptor) : [] })
            });
            const data = await response.json();
            if (data.ok && data.enrolled && data.matched === false) {
              setBlocked(true);
            }
          } catch {
            // Falha ao checar nao deve travar o uso do sistema -- so tenta
            // de novo no proximo intervalo.
          }
        }

        // Primeira checagem logo no inicio, depois periodica.
        void runCheck();
        intervalRef.current = setInterval(runCheck, CHECK_INTERVAL_MS);
      } catch {
        // Sem acesso a camera -- nao bloqueia o uso; so nao ha verificacao
        // periodica nesta sessao.
      }
    }

    void setup();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [enrolled]);

  async function submitChallenge() {
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/face/challenge-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() })
      });
      setBlocked(false);
      setNote('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <video ref={videoRef} muted playsInline style={{ display: 'none' }} aria-hidden="true" />
      {children}
      {blocked && (
        <div className="aios-face-challenge-overlay" role="alertdialog" aria-modal="true">
          <div className="aios-face-challenge-card">
            <h2>Não reconhecemos seu rosto</h2>
            <p>
              O rosto usado para acessar este sistema não corresponde ao cadastro facial de Paulo da Silva Filho.
              Por favor, identifique-se: quem é você e você tem autorização de Paulo para usar este sistema agora?
            </p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Digite seu nome e a autorização que você tem para usar este sistema..."
              rows={4}
            />
            <button className="aios-primary-button" onClick={submitChallenge} disabled={submitting || !note.trim()}>
              {submitting ? 'Enviando...' : 'Enviar identificação e continuar'}
            </button>
            <small>Esta resposta fica registrada e pode ser revisada pelo dono da conta.</small>
          </div>
        </div>
      )}
    </>
  );
}
