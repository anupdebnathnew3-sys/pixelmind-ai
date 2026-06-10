import React, { useEffect, useRef } from 'react';

interface OrbParticle {
  angle: number;
  speed: number;
  size: number;
  trailLength: number;
  color: [number, number, number];
  glowAlpha: number;
}

interface Ring {
  rx: number;       // horizontal radius ratio
  ry: number;       // vertical radius ratio
  tilt: number;     // tilt of the major axis (radians)
  cx: number;       // center x ratio
  cy: number;       // center y ratio
  particles: OrbParticle[];
  color: [number, number, number];
  lineAlpha: number;
}

/**
 * Orbital rings canvas animation.
 * Multiple tilted elliptical rings with glowing particles orbiting along them.
 * A pulsing core glow anchors the center.
 * Colors: gold, cyan, purple, pink, emerald.
 */
export const OrbitCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    resize();

    const rings: Ring[] = [
      {
        rx: 0.32, ry: 0.10, tilt: -0.4, cx: 0.5, cy: 0.5,
        color: [250, 180, 40], lineAlpha: 0.22,
        particles: [
          { angle: 0,    speed: 0.008,  size: 3.5, trailLength: 18, color: [255, 200, 60], glowAlpha: 0.9 },
          { angle: 2.1,  speed: 0.008,  size: 2.5, trailLength: 12, color: [255, 230, 120], glowAlpha: 0.7 },
          { angle: 4.2,  speed: 0.008,  size: 2.0, trailLength: 10, color: [255, 200, 60], glowAlpha: 0.6 },
        ],
      },
      {
        rx: 0.22, ry: 0.16, tilt: 1.1, cx: 0.5, cy: 0.5,
        color: [0, 210, 255], lineAlpha: 0.20,
        particles: [
          { angle: 0.5,  speed: -0.011, size: 3.0, trailLength: 16, color: [80, 220, 255], glowAlpha: 0.9 },
          { angle: 3.2,  speed: -0.011, size: 2.0, trailLength: 10, color: [0, 200, 255], glowAlpha: 0.65 },
        ],
      },
      {
        rx: 0.42, ry: 0.13, tilt: 0.7, cx: 0.5, cy: 0.5,
        color: [160, 60, 255], lineAlpha: 0.18,
        particles: [
          { angle: 1.0,  speed: 0.007,  size: 4.0, trailLength: 20, color: [180, 80, 255], glowAlpha: 1.0 },
          { angle: 2.8,  speed: 0.007,  size: 2.5, trailLength: 14, color: [200, 120, 255], glowAlpha: 0.7 },
          { angle: 5.0,  speed: 0.007,  size: 2.0, trailLength: 10, color: [160, 60, 240], glowAlpha: 0.6 },
        ],
      },
      {
        rx: 0.14, ry: 0.19, tilt: -0.9, cx: 0.5, cy: 0.5,
        color: [236, 72, 153], lineAlpha: 0.20,
        particles: [
          { angle: 0.2,  speed: 0.014,  size: 3.0, trailLength: 14, color: [255, 100, 180], glowAlpha: 0.9 },
          { angle: 3.4,  speed: 0.014,  size: 2.0, trailLength: 9,  color: [240, 80, 160], glowAlpha: 0.65 },
        ],
      },
      {
        rx: 0.36, ry: 0.08, tilt: 0.2, cx: 0.5, cy: 0.5,
        color: [16, 185, 129], lineAlpha: 0.16,
        particles: [
          { angle: 1.5,  speed: -0.009, size: 2.5, trailLength: 12, color: [80, 230, 180], glowAlpha: 0.8 },
          { angle: 4.5,  speed: -0.009, size: 2.0, trailLength: 9,  color: [16, 185, 129], glowAlpha: 0.6 },
        ],
      },
    ];

    // Evaluate point on tilted ellipse
    const ellipsePoint = (ring: Ring, angle: number, W: number, H: number) => {
      const cx = ring.cx * W;
      const cy = ring.cy * H;
      const rx = ring.rx * W;
      const ry = ring.ry * H;
      const cos = Math.cos(ring.tilt);
      const sin = Math.sin(ring.tilt);
      const ex = rx * Math.cos(angle);
      const ey = ry * Math.sin(angle);
      return {
        x: cx + ex * cos - ey * sin,
        y: cy + ex * sin + ey * cos,
      };
    };

    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const isDark = document.documentElement.classList.contains('dark');
      const globalAlpha = isDark ? 1.0 : 0.55;

      // — pulsing core glow —
      const cx = W * 0.5;
      const cy = H * 0.5;
      const pulse = 0.7 + 0.3 * Math.sin(frame * 0.04);
      const coreR = Math.min(W, H) * 0.055 * pulse;

      const coreFx = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3.5);
      coreFx.addColorStop(0,   `rgba(180, 160, 255, ${(0.55 * globalAlpha * pulse).toFixed(3)})`);
      coreFx.addColorStop(0.3, `rgba(130, 100, 255, ${(0.25 * globalAlpha).toFixed(3)})`);
      coreFx.addColorStop(1,   `rgba(80, 60, 200, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = coreFx;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 200, 255, ${(0.85 * globalAlpha * pulse).toFixed(3)})`;
      ctx.fill();

      // — draw rings —
      for (const ring of rings) {
        const STEPS = 180;
        const [r, g, b] = ring.color;
        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
          const angle = (s / STEPS) * Math.PI * 2;
          const pt = ellipsePoint(ring, angle, W, H);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${(ring.lineAlpha * globalAlpha).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // — move & draw particles —
        for (const p of ring.particles) {
          p.angle += p.speed;
          const pt = ellipsePoint(ring, p.angle, W, H);
          const [pr, pg, pb] = p.color;

          // trail
          for (let ti = p.trailLength; ti > 0; ti--) {
            const ta = p.angle - p.speed * ti * 0.7;
            const tp = ellipsePoint(ring, ta, W, H);
            const tAlpha = (1 - ti / p.trailLength) * p.glowAlpha * 0.35 * globalAlpha;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, p.size * (0.3 + 0.7 * (1 - ti / p.trailLength)), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${pr},${pg},${pb},${tAlpha.toFixed(3)})`;
            ctx.fill();
          }

          // glow halo
          const glowR = p.size * 5;
          const gfx = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
          gfx.addColorStop(0,   `rgba(${pr},${pg},${pb},${(p.glowAlpha * 0.6 * globalAlpha).toFixed(3)})`);
          gfx.addColorStop(1,   `rgba(${pr},${pg},${pb},0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = gfx;
          ctx.fill();

          // bright core dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(p.glowAlpha * globalAlpha).toFixed(3)})`;
          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
    />
  );
};
