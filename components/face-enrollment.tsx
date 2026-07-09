'use client';

import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'consent' | 'loading-models' | 'camera-on' | 'capturing' | 'saving' | 'done' | 'error';

export function FaceEnrollmentPanel() {
  const [status, setStatus] = useState<Status>('idle');
  const [enrolled, setEnrolled] = useState(false);
  const [enrolledAt, setEnrolledAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch('/api/face/enroll')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setEnrolled(Boolean(data.enrolled));
          setEnrolledAt(data.enrolledAt ?? null);
        }
      })
      .catch(() => undefined);

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    setError(null);
    setStatus('loading-models');
    try {
      const faceapi = await import('face-api.js');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      // Importante: o elemento <video> só é montado na tela quando o
      // status vira 'camera-on' (renderização condicional). Por isso,
      // conectamos o stream a ele depois, no useEffect abaixo -- que só
      // roda depois que o React garante que o elemento já existe no DOM.
      setStatus('camera-on');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel acessar a camera. Verifique a permissao no navegador.');
      setStatus('error');
    }
  }

  useEffect(() => {
    if (status === 'camera-on' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => undefined);
    }
  }, [status]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function capture() {
    if (!videoRef.current) return;
    setStatus('capturing');
    setError(null);

    try {
      const faceapi = await import('face-api.js');
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('Nenhum rosto detectado. Aproxime-se da câmera, garanta boa iluminação e tente novamente.');
        setStatus('camera-on');
        return;
      }

      setStatus('saving');
      const response = await fetch('/api/face/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(detection.descriptor) })
      });
      const data = await response.json();

      if (!data.ok) {
        setError(data.error ?? 'Nao foi possivel salvar o cadastro facial.');
        setStatus('camera-on');
        return;
      }

      stopCamera();
      setEnrolled(true);
      setEnrolledAt(new Date().toISOString());
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar o rosto.');
      setStatus('camera-on');
    }
  }

  async function handleRemove() {
    setError(null);
    const response = await fetch('/api/face/enroll', { method: 'DELETE' });
    const data = await response.json();
    if (!data.ok) {
      setError(data.error ?? 'Nao foi possivel remover o cadastro facial.');
      return;
    }
    setEnrolled(false);
    setEnrolledAt(null);
    setStatus('idle');
  }

  return (
    <div className="aios-panel aios-face-panel">
      <div className="aios-action-title-row">
        <div>
          <p className="aios-kicker">RECONHECIMENTO FACIAL</p>
          <h2>Entrar com o rosto (opcional)</h2>
          <p className="aios-muted">
            Atalho de conveniência para o login — sua senha continua funcionando normalmente, sempre. O sistema guarda
            apenas um identificador matemático do seu rosto (128 números), nunca a foto ou o vídeo. Esse identificador
            não permite reconstruir sua imagem.
          </p>
        </div>
      </div>

      {enrolled && status !== 'consent' && status !== 'camera-on' && (
        <div className="aios-action-result ok">
          <strong>Rosto cadastrado</strong>
          <p>
            {enrolledAt ? `Cadastrado em ${new Date(enrolledAt).toLocaleDateString('pt-BR')}.` : ''} Você pode remover
            este cadastro a qualquer momento — isso não afeta seu login por senha.
          </p>
          <button className="aios-secondary-button" onClick={handleRemove}>Remover cadastro facial</button>
        </div>
      )}

      {!enrolled && status === 'idle' && (
        <button className="aios-primary-button" onClick={() => setStatus('consent')}>
          Ativar reconhecimento facial
        </button>
      )}

      {status === 'consent' && (
        <div className="aios-action-result">
          <strong>Antes de continuar</strong>
          <p>
            Ao continuar, sua câmera será ativada (o navegador vai pedir permissão) e um identificador matemático do
            seu rosto será calculado e enviado ao servidor para ser guardado com segurança, vinculado só à sua conta.
            Nenhuma imagem ou vídeo é enviado ou armazenado — só o identificador. Você pode remover esse cadastro a
            qualquer momento nesta mesma tela, e seu login por senha nunca deixa de funcionar.
          </p>
          <div className="aios-action-bar">
            <button className="aios-primary-button" onClick={startCamera}>Concordo, ativar câmera</button>
            <button className="aios-secondary-button" onClick={() => setStatus('idle')}>Cancelar</button>
          </div>
        </div>
      )}

      {status === 'loading-models' && <p className="aios-muted">Carregando modelo de reconhecimento facial...</p>}

      {(status === 'camera-on' || status === 'capturing' || status === 'saving') && (
        <div className="aios-face-camera">
          <video ref={videoRef} muted playsInline className="aios-face-video" />
          <div className="aios-action-bar">
            <button className="aios-primary-button" onClick={capture} disabled={status !== 'camera-on'}>
              {status === 'capturing' ? 'Detectando rosto...' : status === 'saving' ? 'Salvando...' : 'Capturar rosto'}
            </button>
            <button
              className="aios-secondary-button"
              onClick={() => {
                stopCamera();
                setStatus('idle');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {status === 'done' && <p className="aios-muted">Cadastro concluído com sucesso.</p>}

      {error && (
        <div className="aios-action-result error">
          <strong>Erro</strong>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
