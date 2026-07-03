'use client';

import { useEffect, useRef } from 'react';

type LivingBackgroundProps = {
  persona?: 'aura' | 'argus';
};

export function LivingBackground({ persona = 'argus' }: LivingBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvas = canvasElement;

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;
    const ctx = canvasContext;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let columns: number[] = [];
    const fontSize = 18;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.ceil(width / fontSize);
      columns = Array.from({ length: count }, () => Math.random() * height);
    }

    function draw() {
      frame += 1;
      const isAura = persona === 'aura';
      ctx.fillStyle = isAura ? 'rgba(11, 5, 24, 0.14)' : 'rgba(2, 7, 16, 0.16)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = isAura ? 12 : 16;
      ctx.shadowColor = isAura ? 'rgba(174, 68, 255, .5)' : 'rgba(34, 211, 238, .55)';

      const primary = isAura ? 'rgba(213, 92, 255, .34)' : 'rgba(34, 211, 238, .34)';
      const secondary = isAura ? 'rgba(255, 69, 184, .18)' : 'rgba(14, 165, 233, .18)';

      columns.forEach((y, index) => {
        if (index % 3 === 0 || frame % 2 === 0) {
          const char = Math.random() > 0.5 ? '1' : '0';
          ctx.fillStyle = index % 7 === 0 ? secondary : primary;
          ctx.fillText(char, index * fontSize + fontSize / 2, y);
        }
        columns[index] = y > height + Math.random() * 1500 ? 0 : y + fontSize * (0.36 + Math.random() * 0.42);
      });

      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [persona]);

  return (
    <div className={`living-bg living-bg-${persona}`} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="living-grid" />
      <div className="living-orb living-orb-a" />
      <div className="living-orb living-orb-b" />
      <div className="living-scanline" />
    </div>
  );
}
