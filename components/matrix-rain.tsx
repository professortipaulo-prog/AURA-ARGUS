'use client';

import { useEffect, useRef } from 'react';

const CHARS = '01AURAARGUS01アイウエオ01';
const FONT_SIZE = 16;

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let columns = 0;
    let drops: number[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      drops = new Array(columns).fill(1);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(3,5,10,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px monospace`;
      for (let i = 0; i < drops.length; i += 1) {
        const text = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0';
        const dropValue = drops[i] ?? 1;
        ctx.fillStyle = Math.random() > 0.985 ? '#EAFBFF' : 'rgba(79,209,255,0.55)';
        ctx.fillText(text, i * FONT_SIZE, dropValue * FONT_SIZE);
        drops[i] = dropValue * FONT_SIZE > canvas.height && Math.random() > 0.975 ? 0 : dropValue + 1;
      }
    }

    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="psfhome-matrix-canvas" aria-hidden="true" />;
}
