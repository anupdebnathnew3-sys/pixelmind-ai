import React, { useEffect, useRef } from 'react';

interface Firefly {
  x: number; y: number;
  // Path driven by sum of sines — no rigid velocity
  ax: number; ay: number;   // base position
  fx1: number; fy1: number; // frequency pair 1
  fx2: number; fy2: number; // frequency pair 2
  px1: number; py1: number; // phase pair 1
  px2: number; py2: number; // phase pair 2
  ampX: number; ampY: number;
  r: number;                // visual radius
  color: [number, number, number];
  pulseOffset: number;
  pulseSpeed: number;
  trail: { x: number; y: number }[];
  trailLen: number;
}

/**
 * Fireflies — 55 softly glowing orbs that wander with organic, sine-driven paths.
 * Each leaves a short fading trail. Warm gold, amber, cyan and soft-green palette.
 */
export const FirefliesCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let flies: Firefly[] = [];

    const PALETTE: [number,number,number][] = [
      [255, 210,  60],  // warm gold
      [255, 170,  30],  // amber
      [ 80, 255, 180],  // mint-cyan
      [160, 255, 100],  // lime
      [255, 140,  80],  // peach
      [200, 255, 140],  // soft-green
      [255, 230, 120],  // lemon
    ];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      spawnFlies();
    };

    const spawnFlies = () => {
      flies = [];
      const count = Math.min(55, Math.max(30, Math.floor((W * H) / 9000)));
      for (let i = 0; i < count; i++) {
        const trailLen = Math.floor(Math.random() * 10 + 8);
        flies.push({
          ax: Math.random() * W,
          ay: Math.random() * H,
          x: 0, y: 0,
          fx1: Math.random() * 0.0006 + 0.0002,
          fy1: Math.random() * 0.0006 + 0.0002,
          fx2: Math.random() * 0.0009 + 0.0003,
          fy2: Math.random() * 0.0009 + 0.0003,
          px1: Math.random() * Math.PI * 2,
          py1: Math.random() * Math.PI * 2,
          px2: Math.random() * Math.PI * 2,
          py2: Math.random() * Math.PI * 2,
          ampX: Math.random() * W * 0.12 + W * 0.04,
          ampY: Math.random() * H * 0.12 + H * 0.04,
          r: Math.random() * 2.5 + 1.5,
          color: PALETTE[i % PALETTE.length],
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
          trail: [],
          trailLen,
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    let t = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t++;
      const isDark = document.documentElement.classList.contains('dark');
      const m = isDark ? 1.0 : 0.5;

      for (const f of flies) {
        // Compute position from sum-of-sines (fully organic wandering)
        f.x = f.ax + Math.sin(t * f.fx1 * 1000 + f.px1) * f.ampX
                   + Math.sin(t * f.fx2 * 1000 + f.px2) * f.ampX * 0.4;
        f.y = f.ay + Math.sin(t * f.fy1 * 1000 + f.py1) * f.ampY
                   + Math.sin(t * f.fy2 * 1000 + f.py2) * f.ampY * 0.4;

        // Keep in bounds — soft clamp
        f.x = Math.max(0, Math.min(W, f.x));
        f.y = Math.max(0, Math.min(H, f.y));

        // Update trail
        f.trail.push({ x: f.x, y: f.y });
        if (f.trail.length > f.trailLen) f.trail.shift();

        const [r, g, b] = f.color;
        const pulse = 0.6 + 0.4 * Math.sin(t * f.pulseSpeed + f.pulseOffset);

        // Draw trail
        for (let ti = 0; ti < f.trail.length - 1; ti++) {
          const tp = ti / f.trail.length;
          const ta = tp * tp * pulse * 0.35 * m;
          const tr = f.r * (0.2 + 0.8 * tp);
          ctx.beginPath();
          ctx.arc(f.trail[ti].x, f.trail[ti].y, tr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${ta.toFixed(3)})`;
          ctx.fill();
        }

        // Glow halo
        const glowR = f.r * 7;
        const gfx = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR);
        gfx.addColorStop(0,   `rgba(${r},${g},${b},${(0.45 * pulse * m).toFixed(3)})`);
        gfx.addColorStop(0.4, `rgba(${r},${g},${b},${(0.18 * pulse * m).toFixed(3)})`);
        gfx.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = gfx;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(0.9 * pulse * m).toFixed(3)})`;
        ctx.fill();
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
