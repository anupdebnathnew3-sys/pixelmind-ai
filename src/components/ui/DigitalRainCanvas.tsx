import React, { useEffect, useRef } from 'react';

interface Column {
  x: number;
  y: number;       // current head y position
  speed: number;   // pixels per frame
  length: number;  // trail length in cells
  color: [number, number, number];
  glowColor: [number, number, number];
  active: boolean;
  delay: number;   // frames before starting
}

/**
 * Digital Rain — vertical streams of falling glowing dots in an indigo/violet/cyan palette.
 * Each column has a bright head dot and a fading colour trail.
 * Far more elegant than the classic green Matrix effect.
 */
export const DigitalRainCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let cols: Column[] = [];

    const PALETTE: [number, number, number][][] = [
      [[100,  80, 255], [160, 130, 255]],   // indigo
      [[180,  60, 255], [220, 130, 255]],   // violet
      [[  0, 200, 255], [ 80, 230, 255]],   // cyan
      [[ 80, 120, 255], [140, 170, 255]],   // periwinkle
      [[200,  80, 255], [230, 160, 255]],   // purple
      [[  0, 230, 200], [ 80, 255, 220]],   // teal
    ];

    const CELL = 20;   // px between dots vertically

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      spawnCols();
    };

    const spawnCols = () => {
      cols = [];
      const colCount = Math.floor(W / 22);
      for (let i = 0; i < colCount; i++) {
        const pairIdx = i % PALETTE.length;
        cols.push({
          x: i * (W / colCount) + (W / colCount) * 0.5,
          y: -Math.random() * H,
          speed: Math.random() * 2.5 + 1.2,
          length: Math.floor(Math.random() * 14 + 8),
          color: PALETTE[pairIdx][0],
          glowColor: PALETTE[pairIdx][1],
          active: Math.random() > 0.35,
          delay: Math.floor(Math.random() * 120),
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    let frame = 0;

    const tick = () => {
      // Dim overlay instead of full clear — leaves ghost trails
      ctx.fillStyle = 'rgba(13,16,48,0.22)';
      ctx.fillRect(0, 0, W, H);

      frame++;
      const isDark = document.documentElement.classList.contains('dark');
      const m = isDark ? 1.0 : 0.45;

      for (const col of cols) {
        if (!col.active) {
          col.delay--;
          if (col.delay <= 0) col.active = true;
          continue;
        }

        col.y += col.speed;

        // Draw trail dots
        for (let ti = 0; ti < col.length; ti++) {
          const ty = col.y - ti * CELL;
          if (ty < -CELL || ty > H + CELL) continue;

          const fade = 1 - ti / col.length;
          const [r, g, b] = ti === 0 ? col.glowColor : col.color;

          // Head dot: bright white + glow
          if (ti === 0) {
            const halo = ctx.createRadialGradient(col.x, ty, 0, col.x, ty, 9);
            halo.addColorStop(0, `rgba(255,255,255,${(0.9 * m).toFixed(3)})`);
            halo.addColorStop(0.4, `rgba(${r},${g},${b},${(0.6 * m).toFixed(3)})`);
            halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(col.x, ty, 9, 0, Math.PI * 2);
            ctx.fillStyle = halo;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(col.x, ty, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${m.toFixed(3)})`;
            ctx.fill();
          } else {
            // Trail dots: fade in colour and size
            const dotR = 2 * fade;
            const dotA = fade * 0.7 * m;
            ctx.beginPath();
            ctx.arc(col.x, ty, dotR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${dotA.toFixed(3)})`;
            ctx.fill();
          }
        }

        // Reset column when it fully exits the bottom
        if (col.y - col.length * CELL > H) {
          col.y = -CELL;
          col.speed  = Math.random() * 2.5 + 1.2;
          col.length = Math.floor(Math.random() * 14 + 8);
          const pairIdx = Math.floor(Math.random() * PALETTE.length);
          col.color  = PALETTE[pairIdx][0];
          col.glowColor = PALETTE[pairIdx][1];
          col.delay  = Math.floor(Math.random() * 80);
          col.active = false;
        }
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
