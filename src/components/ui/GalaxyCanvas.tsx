import React, { useEffect, useRef } from 'react';

interface Star {
  // Spiral-arm parameters
  armAngle: number;     // initial arm angle (0 or PI for 2-arm galaxy)
  armRadius: number;    // radial distance from centre
  armOffset: number;    // lateral scatter
  rotSpeed: number;     // radians per frame
  brightness: number;   // 0–1
  hue: number;          // 0–360
  r: number;            // dot radius px
  twinklePhase: number;
  // Face morph target
  tx: number; ty: number;
  // Display
  x: number; y: number;
}

// Same face-point generator used across all face-morph canvases
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

/**
 * Galaxy Canvas — two-arm logarithmic spiral galaxy that slowly rotates.
 * When the mouse enters, the stars peel away from their orbits and
 * arrange themselves into a glowing cosmic face.
 */
export const GalaxyCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const mouseOn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let stars: Star[] = [];
    let morph = 0;

    const COUNT = 130;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      init();
    };

    const init = () => {
      stars = [];
      const s  = Math.min(W, H) * 0.23;
      const fp = facePoints(W * 0.5, H * 0.48, s, COUNT);
      const maxR = Math.min(W, H) * 0.44;

      for (let i = 0; i < COUNT; i++) {
        const arm      = i % 2;                          // arm 0 or 1
        const t        = i / COUNT;
        const theta    = t * Math.PI * 3.0;              // spiral angle 0–3π
        const r_polar  = 18 + theta * (maxR / (Math.PI * 3.0)); // linear radius growth
        const scatter  = (Math.random() - 0.5) * r_polar * 0.28; // lateral blur

        // Color: arm 0 → blue-white, arm 1 → warm gold, core → white
        const hue = arm === 0
          ? 200 + Math.random() * 40     // cool blue
          : 40  + Math.random() * 30;    // warm gold
        const bright = 0.55 + Math.random() * 0.45;

        stars.push({
          armAngle:    arm * Math.PI,
          armRadius:   r_polar,
          armOffset:   scatter,
          rotSpeed:    0.0004 + Math.random() * 0.0002,
          brightness:  bright,
          hue,
          r:           i < 12 ? 2.5 + Math.random() * 1.5 : 1 + Math.random() * 1.5,
          twinklePhase: Math.random() * Math.PI * 2,
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

      const isDark  = document.documentElement.classList.contains('dark');
      const alphaMod = isDark ? 1.0 : 0.55;

      morph += mouseOn.current ? 0.020 : -0.020;
      morph  = Math.max(0, Math.min(1, morph));
      const ease = morph * morph * (3 - 2 * morph); // smoothstep

      const cx = W * 0.5, cy = H * 0.5;

      // Soft core glow
      const coreSize = Math.min(W, H) * 0.09;
      const coreGrd  = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      coreGrd.addColorStop(0,   `rgba(255,255,240,${(0.5 * alphaMod * (1 - ease * 0.8)).toFixed(3)})`);
      coreGrd.addColorStop(0.5, `rgba(200,160,255,${(0.22 * alphaMod * (1 - ease * 0.8)).toFixed(3)})`);
      coreGrd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd;
      ctx.fill();

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const rot = frame * st.rotSpeed;

        // Natural galaxy position
        const arm_a = st.armAngle + frame * st.rotSpeed * 0.5;
        const theta  = st.armRadius / (Math.min(W, H) * 0.44) * Math.PI * 3.0;
        const angle  = arm_a + theta + rot;
        const perp   = angle + Math.PI / 2;
        const nx = cx + Math.cos(angle) * st.armRadius + Math.cos(perp) * st.armOffset;
        const ny = cy + Math.sin(angle) * st.armRadius * 0.52 + Math.sin(perp) * st.armOffset * 0.52;

        // Lerp to face target
        st.x = nx * (1 - ease) + st.tx * ease;
        st.y = ny * (1 - ease) + st.ty * ease;

        const twinkle = 0.6 + 0.4 * Math.sin(frame * 0.04 + st.twinklePhase);
        const alpha   = st.brightness * twinkle * alphaMod;
        const radius  = st.r * (1 + ease * 0.4);

        ctx.globalCompositeOperation = 'screen';
        const grd = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, radius * 3);
        grd.addColorStop(0,   `hsla(${st.hue},90%,95%,${alpha.toFixed(3)})`);
        grd.addColorStop(0.3, `hsla(${st.hue},80%,70%,${(alpha * 0.6).toFixed(3)})`);
        grd.addColorStop(1,   `hsla(${st.hue},70%,50%,0)`);
        ctx.beginPath();
        ctx.arc(st.x, st.y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Crisp dot at centre
        ctx.beginPath();
        ctx.arc(st.x, st.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${st.hue},100%,98%,${alpha.toFixed(3)})`;
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
