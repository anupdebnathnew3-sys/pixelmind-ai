import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: [number, number, number];
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: [number, number, number];
}

/**
 * Deep space starfield canvas animation.
 * ~220 twinkling stars with subtle color variation.
 * Shooting stars streak across the canvas every few seconds.
 * Translucent nebula clouds add depth and color.
 */
export const StarfieldCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let stars: Star[] = [];
    let shooters: ShootingStar[] = [];
    let shooterTimer = 0;

    const STAR_COLORS: [number, number, number][] = [
      [255, 255, 255],
      [200, 220, 255],
      [255, 240, 200],
      [200, 255, 240],
      [240, 200, 255],
      [255, 210, 200],
    ];

    const SHOOTER_COLORS: [number, number, number][] = [
      [255, 255, 255],
      [200, 230, 255],
      [255, 220, 130],
      [180, 255, 230],
    ];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      spawnStars();
    };

    const spawnStars = () => {
      stars = [];
      const count = Math.min(220, Math.floor((W * H) / 4000));
      for (let i = 0; i < count; i++) {
        const r = Math.random() < 0.05 ? (Math.random() * 1.5 + 1.5) : (Math.random() * 1.2 + 0.3);
        const baseAlpha = Math.random() * 0.5 + 0.25;
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: Math.random() * 0.025 + 0.008,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
    };

    const spawnShooter = () => {
      const angle = (Math.random() * 0.5 + 0.1) * Math.PI; // roughly left→right diagonal
      const speed = Math.random() * 6 + 5;
      const startX = Math.random() * W * 0.6;
      const startY = Math.random() * H * 0.4;
      const maxLife = Math.floor(Math.random() * 40 + 40);
      shooters.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5,
        len: Math.random() * 100 + 60,
        alpha: 0,
        life: 0,
        maxLife,
        color: SHOOTER_COLORS[Math.floor(Math.random() * SHOOTER_COLORS.length)],
      });
    };

    window.addEventListener('resize', resize);
    resize();

    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const isDark = document.documentElement.classList.contains('dark');
      const globalMult = isDark ? 1.0 : 0.45;

      // — nebula clouds (static, painted via gradient circles) —
      const nebulae = [
        { x: 0.18, y: 0.3,  r: 0.22, color: [100, 60, 200]  as [number,number,number], a: 0.09 },
        { x: 0.75, y: 0.55, r: 0.28, color: [20, 100, 200]   as [number,number,number], a: 0.07 },
        { x: 0.5,  y: 0.15, r: 0.20, color: [200, 60, 160]   as [number,number,number], a: 0.06 },
        { x: 0.88, y: 0.2,  r: 0.16, color: [40, 180, 150]   as [number,number,number], a: 0.08 },
        { x: 0.3,  y: 0.75, r: 0.19, color: [160, 100, 255]  as [number,number,number], a: 0.07 },
      ];
      for (const n of nebulae) {
        const cx = n.x * W;
        const cy = n.y * H;
        const rr = n.r * Math.min(W, H);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        const [r, g, b] = n.color;
        grd.addColorStop(0,   `rgba(${r},${g},${b},${(n.a * globalMult).toFixed(3)})`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${(n.a * 0.4 * globalMult).toFixed(3)})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // — twinkling stars —
      for (const s of stars) {
        const flicker = 0.5 + 0.5 * Math.sin(frame * s.twinkleSpeed + s.twinkleOffset);
        s.alpha = s.baseAlpha * (0.5 + 0.5 * flicker);
        const [r, g, b] = s.color;

        // subtle halo for larger stars
        if (s.r > 1.2) {
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          halo.addColorStop(0, `rgba(${r},${g},${b},${(s.alpha * 0.35 * globalMult).toFixed(3)})`);
          halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${(s.alpha * globalMult).toFixed(3)})`;
        ctx.fill();
      }

      // — shooting stars —
      shooterTimer++;
      if (shooterTimer > 90 + Math.random() * 120) {
        spawnShooter();
        shooterTimer = 0;
      }

      shooters = shooters.filter(s => s.life <= s.maxLife);
      for (const s of shooters) {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        // fade in then out
        const progress = s.life / s.maxLife;
        s.alpha = progress < 0.2
          ? (progress / 0.2)
          : progress > 0.7
            ? (1 - (progress - 0.7) / 0.3)
            : 1;

        const [r, g, b] = s.color;
        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.len;
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.len;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0,   `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},${(s.alpha * 0.5 * globalMult).toFixed(3)})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},${(s.alpha * globalMult).toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // bright head dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.alpha * globalMult).toFixed(3)})`;
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
