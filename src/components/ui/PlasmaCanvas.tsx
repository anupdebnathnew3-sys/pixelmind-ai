import React, { useEffect, useRef } from 'react';

interface PlasmaBlob {
  // Position driven by sum-of-sines for smooth organic drift
  cx: number; cy: number;   // base centre ratios
  fx1: number; fy1: number;
  fx2: number; fy2: number;
  px1: number; py1: number;
  px2: number; py2: number;
  ampX: number; ampY: number;
  radius: number;            // ratio of min(W,H)
  color: [number, number, number];
  alphaBase: number;
  pulseOffset: number;
  pulseSpeed: number;
}

/**
 * Plasma Blobs — large luminous colour orbs that drift organically and
 * blend together via additive (screen) compositing, producing vivid
 * plasma / lava-lamp / nebula colouring wherever they overlap.
 */
export const PlasmaCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
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

    const blobs: PlasmaBlob[] = [
      { cx: 0.25, cy: 0.35, fx1: 0.00022, fy1: 0.00018, fx2: 0.00038, fy2: 0.00030, px1: 0.0, py1: 1.2, px2: 2.4, py2: 0.8, ampX: 0.18, ampY: 0.14, radius: 0.40, color: [120,  40, 255], alphaBase: 0.55, pulseOffset: 0.0,  pulseSpeed: 0.018 },
      { cx: 0.75, cy: 0.55, fx1: 0.00028, fy1: 0.00022, fx2: 0.00015, fy2: 0.00040, px1: 3.1, py1: 0.5, px2: 1.8, py2: 3.2, ampX: 0.16, ampY: 0.18, radius: 0.38, color: [  0, 160, 255], alphaBase: 0.55, pulseOffset: 1.5,  pulseSpeed: 0.022 },
      { cx: 0.50, cy: 0.20, fx1: 0.00018, fy1: 0.00032, fx2: 0.00040, fy2: 0.00020, px1: 1.6, py1: 2.8, px2: 0.4, py2: 1.6, ampX: 0.14, ampY: 0.12, radius: 0.35, color: [255,  40, 160], alphaBase: 0.50, pulseOffset: 3.0,  pulseSpeed: 0.016 },
      { cx: 0.30, cy: 0.75, fx1: 0.00030, fy1: 0.00015, fx2: 0.00022, fy2: 0.00035, px1: 4.2, py1: 1.0, px2: 2.0, py2: 4.5, ampX: 0.15, ampY: 0.16, radius: 0.32, color: [ 20, 220, 180], alphaBase: 0.48, pulseOffset: 4.5,  pulseSpeed: 0.020 },
      { cx: 0.80, cy: 0.25, fx1: 0.00025, fy1: 0.00028, fx2: 0.00018, fy2: 0.00022, px1: 2.8, py1: 3.8, px2: 1.1, py2: 2.3, ampX: 0.13, ampY: 0.15, radius: 0.30, color: [255, 160,  20], alphaBase: 0.45, pulseOffset: 6.0,  pulseSpeed: 0.024 },
      { cx: 0.55, cy: 0.80, fx1: 0.00020, fy1: 0.00025, fx2: 0.00033, fy2: 0.00018, px1: 1.3, py1: 0.7, px2: 3.5, py2: 1.9, ampX: 0.17, ampY: 0.13, radius: 0.28, color: [200, 255,  80], alphaBase: 0.40, pulseOffset: 2.2,  pulseSpeed: 0.019 },
    ];

    let t = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t++;

      const isDark = document.documentElement.classList.contains('dark');
      const m = isDark ? 1.0 : 0.40;

      // Screen blending: blobs add light where they overlap
      ctx.globalCompositeOperation = 'screen';

      for (const b of blobs) {
        const x = (b.cx + Math.sin(t * b.fx1 * 1000 + b.px1) * b.ampX
                       + Math.sin(t * b.fx2 * 1000 + b.px2) * b.ampX * 0.45) * W;
        const y = (b.cy + Math.sin(t * b.fy1 * 1000 + b.py1) * b.ampY
                       + Math.sin(t * b.fy2 * 1000 + b.py2) * b.ampY * 0.45) * H;

        const pulse = 0.75 + 0.25 * Math.sin(t * b.pulseSpeed + b.pulseOffset);
        const r_px  = b.radius * Math.min(W, H) * pulse;
        const [r, g, b_] = b.color;
        const alpha = b.alphaBase * pulse * m;

        const grd = ctx.createRadialGradient(x, y, 0, x, y, r_px);
        grd.addColorStop(0,    `rgba(${r},${g},${b_},${alpha.toFixed(3)})`);
        grd.addColorStop(0.35, `rgba(${r},${g},${b_},${(alpha * 0.65).toFixed(3)})`);
        grd.addColorStop(0.65, `rgba(${r},${g},${b_},${(alpha * 0.25).toFixed(3)})`);
        grd.addColorStop(1,    `rgba(${r},${g},${b_},0)`);

        ctx.beginPath();
        ctx.arc(x, y, r_px, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Reset blending for any subsequent draws
      ctx.globalCompositeOperation = 'source-over';

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
