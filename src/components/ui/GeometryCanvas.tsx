import React, { useEffect, useRef } from 'react';

interface GShape {
  x: number; y: number;
  vx: number; vy: number;
  sides: number;
  radius: number;
  rotAngle: number;
  rotSpeed: number;
  color: [number, number, number];
  alpha: number;
  pulseOffset: number;
}

/**
 * Floating Geometry — glowing wireframe polygons drift and slowly rotate.
 * Shapes close to each other emit faint connection beams.
 * Colours: gold, cyan, violet, rose, lime, sky-blue.
 */
export const GeometryCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let shapes: GShape[] = [];

    const PALETTE: [number,number,number][] = [
      [250, 190,  50],  // gold
      [  0, 220, 255],  // cyan
      [180,  60, 255],  // violet
      [255,  80, 160],  // rose
      [ 80, 230, 120],  // lime
      [ 80, 160, 255],  // sky-blue
      [255, 140,  50],  // orange
    ];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    const spawnShapes = () => {
      shapes = [];
      const count = Math.min(14, Math.max(8, Math.floor(W / 140)));
      for (let i = 0; i < count; i++) {
        const sides = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
        shapes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          sides,
          radius: Math.random() * 30 + 20,
          rotAngle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.012,
          color: PALETTE[i % PALETTE.length],
          alpha: Math.random() * 0.3 + 0.45,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', () => { resize(); spawnShapes(); });
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    resize();
    spawnShapes();

    const drawPoly = (s: GShape, alpha: number) => {
      const [r, g, b] = s.color;
      ctx.beginPath();
      for (let i = 0; i < s.sides; i++) {
        const a = s.rotAngle + (i / s.sides) * Math.PI * 2;
        const px = s.x + Math.cos(a) * s.radius;
        const py = s.y + Math.sin(a) * s.radius;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Subtle inner fill
      ctx.fillStyle = `rgba(${r},${g},${b},${(alpha * 0.06).toFixed(3)})`;
      ctx.fill();
    };

    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      const isDark = document.documentElement.classList.contains('dark');
      const m = isDark ? 1.0 : 0.55;
      const CONN_DIST = Math.min(W, H) * 0.28;
      const mx = mouse.current.x, my = mouse.current.y;

      // Move shapes
      for (const s of shapes) {
        // Mouse repulsion
        const dx = s.x - mx, dy = s.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 90000 && d2 > 0.1) {
          const d = Math.sqrt(d2);
          const f = ((300 - d) / 300) * 0.5;
          s.vx += (dx / d) * f;
          s.vy += (dy / d) * f;
        }
        const spd = Math.hypot(s.vx, s.vy);
        if (spd > 1.2) { s.vx = (s.vx / spd) * 1.2; s.vy = (s.vy / spd) * 1.2; }

        s.x += s.vx;
        s.y += s.vy;
        s.rotAngle += s.rotSpeed;

        // Wrap
        const pad = s.radius + 10;
        if (s.x < -pad) s.x = W + pad;
        else if (s.x > W + pad) s.x = -pad;
        if (s.y < -pad) s.y = H + pad;
        else if (s.y > H + pad) s.y = -pad;
      }

      // Connection beams between close shapes
      for (let i = 0; i < shapes.length - 1; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const a = shapes[i], b = shapes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONN_DIST) {
            const fade = (1 - dist / CONN_DIST) * 0.18 * m;
            const [ar, ag, ab_] = a.color;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${ar},${ag},${ab_},${fade.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw shapes
      for (const s of shapes) {
        const pulse = 0.75 + 0.25 * Math.sin(frame * 0.025 + s.pulseOffset);
        drawPoly(s, s.alpha * pulse * m);
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', () => { resize(); spawnShapes(); });
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
