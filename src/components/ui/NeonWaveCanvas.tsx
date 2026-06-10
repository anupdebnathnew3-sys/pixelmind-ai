import React, { useEffect, useRef } from 'react';

/**
 * Neon Wave — multiple layered glowing sine waves with vivid neon colours.
 * Each wave has its own frequency, amplitude, speed, phase and colour.
 * Canvas glow (shadowBlur) gives each line a bright neon-tube look.
 */
export const NeonWaveCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    window.addEventListener('resize', resize);
    resize();

    const waves = [
      { amp: 0.09, freq: 0.0055, speed: 0.00065, phase: 0.0, color: [255,  20, 147] as [number,number,number], alpha: 0.75, lw: 2.5 },
      { amp: 0.11, freq: 0.0040, speed: 0.00050, phase: 1.3, color: [ 58, 134, 255] as [number,number,number], alpha: 0.70, lw: 2.0 },
      { amp: 0.07, freq: 0.0080, speed: 0.00090, phase: 2.6, color: [  0, 255, 200] as [number,number,number], alpha: 0.65, lw: 1.8 },
      { amp: 0.10, freq: 0.0065, speed: 0.00055, phase: 0.7, color: [255, 210,  20] as [number,number,number], alpha: 0.55, lw: 1.5 },
      { amp: 0.06, freq: 0.0100, speed: 0.00110, phase: 3.9, color: [255,  80,  30] as [number,number,number], alpha: 0.50, lw: 1.5 },
      { amp: 0.13, freq: 0.0030, speed: 0.00040, phase: 1.9, color: [190,  60, 255] as [number,number,number], alpha: 0.45, lw: 3.2 },
      { amp: 0.05, freq: 0.0120, speed: 0.00130, phase: 4.5, color: [ 80, 230, 255] as [number,number,number], alpha: 0.45, lw: 1.2 },
    ];

    let t = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t++;
      const isDark = document.documentElement.classList.contains('dark');
      const m = isDark ? 1.0 : 0.55;

      for (const w of waves) {
        const [r, g, b] = w.color;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = H * 0.5
            + Math.sin(x * w.freq + t * w.speed * 1000 + w.phase) * H * w.amp
            + Math.sin(x * w.freq * 1.6 + t * w.speed * 750  + w.phase + 0.8) * H * w.amp * 0.35;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${r},${g},${b},${(w.alpha * m).toFixed(3)})`;
        ctx.lineWidth   = w.lw;
        ctx.shadowBlur  = 18;
        ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
};
