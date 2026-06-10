import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  pulseOffset: number;
}

/**
 * Canvas-based animated particle network for the homepage hero.
 * - 85 floating particles with gentle velocity
 * - Lines drawn between particles within connection distance, fading by proximity
 * - Mouse repulsion: cursor pushes particles away subtly
 * - Colors auto-adapt to light / dark mode by reading html.dark class
 * - Particles wrap around edges for seamless fluid motion
 * - Full cleanup on unmount
 */
export const HeroCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -2000, y: -2000 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COUNT = 95;
    const LINK_DIST = 155;
    const SPEED_MAX = 1.1;
    const MOUSE_RADIUS = 130;
    const MOUSE_FORCE = 0.045;

    let W = 0;
    let H = 0;
    const pts: Particle[] = [];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const spawn = () => {
      pts.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.55 + 0.15;
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 1.8 + 0.7,
          a: Math.random() * 0.4 + 0.25,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleResize = () => {
      resize();
      spawn();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -2000, y: -2000 };
    };

    resize();
    spawn();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const isDark = document.documentElement.classList.contains('dark');
      // Light mode: deep indigo-600 for strong visibility on white.
      // Dark mode: softer indigo-300 for premium feel.
      const dotRGB = isDark ? '165,180,252' : '79,70,229';
      const lineRGB = isDark ? '165,180,252' : '79,70,229';
      const dotMultiplier = isDark ? 1.0 : 1.0;
      const lineMultiplier = isDark ? 0.22 : 0.32;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // — update & draw dots —
      for (const p of pts) {
        // Mouse repulsion
        const ddx = p.x - mx;
        const ddy = p.y - my;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 0.1) {
          const d = Math.sqrt(d2);
          const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += (ddx / d) * f;
          p.vy += (ddy / d) * f;
        }

        // Tiny random drift to keep things alive
        p.vx += (Math.random() - 0.5) * 0.005;
        p.vy += (Math.random() - 0.5) * 0.005;

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > SPEED_MAX) {
          p.vx = (p.vx / spd) * SPEED_MAX;
          p.vy = (p.vy / spd) * SPEED_MAX;
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges (seamless)
        if (p.x < -15) p.x = W + 15;
        else if (p.x > W + 15) p.x = -15;
        if (p.y < -15) p.y = H + 15;
        else if (p.y > H + 15) p.y = -15;

        // Gentle pulse on alpha
        const pulse = 1 + 0.25 * Math.sin(frame * 0.02 + p.pulseOffset);
        const alpha = Math.min(1, p.a * pulse * dotMultiplier);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotRGB},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // — draw connection lines —
      for (let i = 0; i < COUNT - 1; i++) {
        const a = pts[i];
        for (let j = i + 1; j < COUNT; j++) {
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * lineMultiplier;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineRGB},${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
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
