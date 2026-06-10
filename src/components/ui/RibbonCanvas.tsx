import React, { useEffect, useRef } from 'react';

interface Particle {
  // Ribbon identity
  ribbonIdx: number;
  tAlong: number;        // 0–1 position along ribbon
  // Idle simulation
  baseY: number;         // vertical centre of ribbon
  freq: number;          // wave frequency multiplier
  phase: number;         // wave phase offset
  speed: number;         // scroll speed (pixels/frame)
  scrollOffset: number;  // current horizontal offset
  amplitude: number;     // wave amplitude
  hue: number;
  alpha: number;
  r: number;             // dot radius
  // Face morph target
  tx: number; ty: number;
  // Display
  x: number; y: number;
}

function facePoints(cx: number, cy: number, s: number, n: number) {
  const pts: { x: number; y: number }[] = [];
  const outN   = Math.ceil(n * 0.22);
  const eyeN   = Math.ceil(n * 0.13);
  const noseN  = Math.ceil(n * 0.06);
  const smileN = n - outN - eyeN * 2 - noseN;

  for (let i = 0; i < outN; i++) {
    const a = (i / outN) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * s, y: cy + Math.sin(a) * s * 1.1 });
  }
  for (let i = 0; i < eyeN; i++) {
    const a  = (i / eyeN) * Math.PI * 2;
    const r  = Math.sqrt((i + 1) / eyeN) * s * 0.17;
    pts.push({ x: cx - s * 0.33 + Math.cos(a) * r, y: cy - s * 0.27 + Math.sin(a) * r });
  }
  for (let i = 0; i < eyeN; i++) {
    const a  = (i / eyeN) * Math.PI * 2;
    const r  = Math.sqrt((i + 1) / eyeN) * s * 0.17;
    pts.push({ x: cx + s * 0.33 + Math.cos(a) * r, y: cy - s * 0.27 + Math.sin(a) * r });
  }
  for (let i = 0; i < noseN; i++) {
    const t = i / Math.max(noseN - 1, 1);
    pts.push({ x: cx + (t - 0.5) * s * 0.14, y: cy + s * (0.04 + t * 0.14) });
  }
  for (let i = 0; i < smileN; i++) {
    const t = i / Math.max(smileN - 1, 1);
    pts.push({
      x: cx + (t - 0.5) * 2 * s * 0.46,
      y: cy + s * 0.34 + Math.sin(t * Math.PI) * s * 0.20,
    });
  }
  return pts.slice(0, n);
}

// Vivid ribbon hues — each ribbon gets its own hue
const RIBBON_HUES = [200, 270, 320, 170, 40, 60, 190, 290];

/**
 * Ribbon Canvas — shimmering liquid streams of colour flow horizontally
 * across the canvas in sine-wave ribbons. Hover to watch them dissolve
 * and reassemble as a radiant face.
 */
export const RibbonCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const mouseOn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let particles: Particle[] = [];
    let morph = 0;

    const RIBBONS = 8;
    const PER_RIBBON = 16;        // particles per ribbon
    const COUNT = RIBBONS * PER_RIBBON;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      init();
    };

    const init = () => {
      particles = [];
      const s  = Math.min(W, H) * 0.23;
      const fp = facePoints(W * 0.5, H * 0.48, s, COUNT);

      let idx = 0;
      for (let ri = 0; ri < RIBBONS; ri++) {
        const baseY     = H * (0.08 + ri * (0.85 / (RIBBONS - 1)));
        const freq      = 1.5 + ri * 0.4 + Math.random() * 0.5;
        const phase     = Math.random() * Math.PI * 2;
        const speed     = 0.4 + Math.random() * 0.5;
        const amplitude = H * (0.03 + Math.random() * 0.04);
        const hue       = RIBBON_HUES[ri % RIBBON_HUES.length];

        for (let pi = 0; pi < PER_RIBBON; pi++) {
          const tAlong = pi / (PER_RIBBON - 1);
          particles.push({
            ribbonIdx:    ri,
            tAlong,
            baseY,
            freq,
            phase,
            speed,
            scrollOffset: 0,
            amplitude,
            hue,
            alpha: 0.55 + Math.random() * 0.35,
            r: 2 + Math.random() * 2.5,
            tx: fp[idx].x,
            ty: fp[idx].y,
            x: 0, y: 0,
          });
          idx++;
        }
      }
    };

    const onEnter = () => { mouseOn.current = true; };
    const onLeave = () => { mouseOn.current = false; };
    window.addEventListener('resize', resize);
    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    resize();

    // Track per-ribbon scroll independently
    const ribbonScroll: number[] = Array.from({ length: RIBBONS }, () => 0);
    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const isDark   = document.documentElement.classList.contains('dark');
      const alphaMod = isDark ? 1.0 : 0.50;

      morph += mouseOn.current ? 0.022 : -0.022;
      morph  = Math.max(0, Math.min(1, morph));
      const ease = morph * morph * (3 - 2 * morph);

      // Advance ribbon scrolls
      for (let ri = 0; ri < RIBBONS; ri++) {
        ribbonScroll[ri] += particles.find(p => p.ribbonIdx === ri)?.speed ?? 0.5;
      }

      ctx.globalCompositeOperation = 'screen';

      for (const p of particles) {
        const scroll = ribbonScroll[p.ribbonIdx];
        // Natural position: particle travels along the ribbon curve
        const xOffset = ((p.tAlong * W - scroll) % (W + 40) + (W + 40)) % (W + 40) - 20;
        const nx = xOffset;
        const ny = p.baseY + Math.sin((xOffset / W) * p.freq * Math.PI * 2 + p.phase + frame * 0.012) * p.amplitude;

        // Lerp to face target
        p.x = nx * (1 - ease) + p.tx * ease;
        p.y = ny * (1 - ease) + p.ty * ease;

        const sat   = 80 + ease * 20;
        const light = 55 + ease * 20;
        const a     = p.alpha * alphaMod;

        // Glowing blob per particle
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.5);
        grd.addColorStop(0,   `hsla(${p.hue},${sat}%,${light + 30}%,${a.toFixed(3)})`);
        grd.addColorStop(0.3, `hsla(${p.hue},${sat}%,${light}%,${(a * 0.65).toFixed(3)})`);
        grd.addColorStop(1,   `hsla(${p.hue},${sat}%,${light}%,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Bright core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,92%,${(a * 1.1).toFixed(3)})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
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
