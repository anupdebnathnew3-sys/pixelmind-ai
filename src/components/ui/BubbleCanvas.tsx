import React, { useEffect, useRef } from 'react';

interface Bubble {
  baseX: number;
  startY: number;
  riseSpeed: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  r: number;
  color: [number, number, number];
  alpha: number;
  tx: number; ty: number;   // face target
  x:  number; y:  number;   // current display
}

// Returns n points arranged as a smiley face centred on (cx,cy) with radius s
function facePoints(cx: number, cy: number, s: number, n: number) {
  const pts: { x: number; y: number }[] = [];
  const outN   = Math.ceil(n * 0.22);
  const eyeN   = Math.ceil(n * 0.13);
  const noseN  = Math.ceil(n * 0.06);
  const smileN = n - outN - eyeN * 2 - noseN;

  // Oval outline
  for (let i = 0; i < outN; i++) {
    const a = (i / outN) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * s, y: cy + Math.sin(a) * s * 1.1 });
  }
  // Left eye (filled disk)
  for (let i = 0; i < eyeN; i++) {
    const a  = (i / eyeN) * Math.PI * 2;
    const r  = Math.sqrt((i + 1) / eyeN) * s * 0.17;
    pts.push({ x: cx - s * 0.33 + Math.cos(a) * r, y: cy - s * 0.27 + Math.sin(a) * r });
  }
  // Right eye
  for (let i = 0; i < eyeN; i++) {
    const a  = (i / eyeN) * Math.PI * 2;
    const r  = Math.sqrt((i + 1) / eyeN) * s * 0.17;
    pts.push({ x: cx + s * 0.33 + Math.cos(a) * r, y: cy - s * 0.27 + Math.sin(a) * r });
  }
  // Nose (small arch)
  for (let i = 0; i < noseN; i++) {
    const t = i / Math.max(noseN - 1, 1);
    pts.push({ x: cx + (t - 0.5) * s * 0.14, y: cy + s * (0.04 + t * 0.14) });
  }
  // Smile arc (U-shape)
  for (let i = 0; i < smileN; i++) {
    const t = i / Math.max(smileN - 1, 1);
    pts.push({
      x: cx + (t - 0.5) * 2 * s * 0.46,
      y: cy + s * 0.34 + Math.sin(t * Math.PI) * s * 0.20,
    });
  }
  return pts.slice(0, n);
}

const COLORS: [number, number, number][] = [
  [255, 107, 157], [255, 160,  64], [255, 210,  50],
  [  0, 200, 180], [ 70, 180, 255], [160, 100, 255],
  [255,  80, 120], [ 80, 230, 150], [220, 100, 255],
  [255, 140,  90], [ 50, 210, 220], [255, 185,  60],
];

/**
 * Bubble Canvas — colourful floating bubbles that morph into a
 * cheerful smiley face when the mouse moves over the hero.
 */
export const BubbleCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const mouseOn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let bubbles: Bubble[] = [];
    let morph = 0;

    const COUNT = 110;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      init();
    };

    const init = () => {
      bubbles = [];
      const s = Math.min(W, H) * 0.23;
      const fp = facePoints(W * 0.5, H * 0.48, s, COUNT);
      for (let i = 0; i < COUNT; i++) {
        const r = Math.random() * 13 + 5;
        bubbles.push({
          baseX: Math.random() * W,
          startY: Math.random() * (H + 60),
          riseSpeed: Math.random() * 0.55 + 0.25,
          swayAmp: Math.random() * 28 + 8,
          swayFreq: Math.random() * 0.012 + 0.006,
          swayPhase: Math.random() * Math.PI * 2,
          r,
          color: COLORS[i % COLORS.length],
          alpha: Math.random() * 0.3 + 0.55,
          tx: fp[i].x,
          ty: fp[i].y,
          x: 0, y: 0,
        });
      }
    };

    const onEnter = () => { mouseOn.current = true; };
    const onLeave = () => { mouseOn.current = false; };
    window.addEventListener('resize', resize);
    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    resize();

    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      const isDark = document.documentElement.classList.contains('dark');
      const gm = isDark ? 1.0 : 0.5;

      morph += mouseOn.current ? 0.022 : -0.022;
      morph = Math.max(0, Math.min(1, morph));

      // Eased morph for smooth feel
      const ease = morph * morph * (3 - 2 * morph); // smoothstep

      for (const b of bubbles) {
        // Idle natural position
        const yRaw = b.startY - frame * b.riseSpeed;
        const wrap = ((yRaw % (H + b.r * 2)) + (H + b.r * 2)) % (H + b.r * 2) - b.r;
        const nx = b.baseX + Math.sin(frame * b.swayFreq + b.swayPhase) * b.swayAmp;
        const ny = wrap;

        // Lerp between idle and face target
        b.x = nx * (1 - ease) + b.tx * ease;
        b.y = ny * (1 - ease) + b.ty * ease;

        const [r, g, bv] = b.color;
        const a = b.alpha * gm;
        const radius = ease > 0.5 ? b.r * (1 - (ease - 0.5) * 0.6) : b.r;

        // Bubble fill with radial gradient
        const grd = ctx.createRadialGradient(
          b.x - radius * 0.3, b.y - radius * 0.3, radius * 0.1,
          b.x, b.y, radius
        );
        grd.addColorStop(0, `rgba(255,255,255,${(a * 0.7).toFixed(3)})`);
        grd.addColorStop(0.4, `rgba(${r},${g},${bv},${a.toFixed(3)})`);
        grd.addColorStop(1,   `rgba(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,bv-60)},${(a*0.6).toFixed(3)})`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Highlight glint
        ctx.beginPath();
        ctx.arc(b.x - radius * 0.3, b.y - radius * 0.32, radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(a * 0.55).toFixed(3)})`;
        ctx.fill();
      }

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
