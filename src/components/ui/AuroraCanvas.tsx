import React, { useEffect, useRef } from 'react';

/**
 * Aurora Borealis canvas animation.
 * Flowing colorful curtains of light drift across the hero.
 * Multiple sinusoidal bands in electric blues, violets, cyans, greens and magentas.
 * Responds to light/dark mode automatically.
 */
export const AuroraCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

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

    window.addEventListener('resize', resize);
    resize();

    // Each band has: y-center ratio, amplitude, frequency, speed, color
    const bands = [
      { yBase: 0.18, amp: 0.08, freq: 0.0025, speed: 0.00018, color: [0, 255, 180],    alpha: 0.18 },
      { yBase: 0.32, amp: 0.12, freq: 0.0018, speed: 0.00022, color: [100, 120, 255],  alpha: 0.20 },
      { yBase: 0.50, amp: 0.10, freq: 0.0030, speed: 0.00015, color: [0, 210, 255],    alpha: 0.16 },
      { yBase: 0.65, amp: 0.09, freq: 0.0022, speed: 0.00020, color: [180, 60, 255],   alpha: 0.18 },
      { yBase: 0.78, amp: 0.07, freq: 0.0028, speed: 0.00017, color: [0, 255, 140],    alpha: 0.14 },
      { yBase: 0.42, amp: 0.14, freq: 0.0016, speed: 0.00025, color: [255, 80, 220],   alpha: 0.12 },
    ];

    let t = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t += 1;

      const isDark = document.documentElement.classList.contains('dark');
      const bandWidth = H * 0.22;

      for (const band of bands) {
        const [r, g, b] = band.color;
        const a = isDark ? band.alpha : band.alpha * 0.5;

        // Draw the band as a filled sinusoidal ribbon
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const wave1 = Math.sin(x * band.freq + t * band.speed * 1000);
          const wave2 = Math.sin(x * band.freq * 1.7 + t * band.speed * 800 + 1.2);
          const cy = (band.yBase + (wave1 * 0.6 + wave2 * 0.4) * band.amp) * H;
          if (x === 0) ctx.moveTo(x, cy - bandWidth / 2);
          else ctx.lineTo(x, cy - bandWidth / 2);
        }
        for (let x = W; x >= 0; x -= 3) {
          const wave1 = Math.sin(x * band.freq + t * band.speed * 1000);
          const wave2 = Math.sin(x * band.freq * 1.7 + t * band.speed * 800 + 1.2);
          const cy = (band.yBase + (wave1 * 0.6 + wave2 * 0.4) * band.amp) * H;
          ctx.lineTo(x, cy + bandWidth / 2);
        }
        ctx.closePath();

        // Vertical gradient from transparent edge to color center
        const sample = (band.yBase * H);
        const grd = ctx.createLinearGradient(0, sample - bandWidth / 2, 0, sample + bandWidth / 2);
        grd.addColorStop(0,    `rgba(${r},${g},${b},0)`);
        grd.addColorStop(0.3,  `rgba(${r},${g},${b},${(a * 0.7).toFixed(3)})`);
        grd.addColorStop(0.5,  `rgba(${r},${g},${b},${a.toFixed(3)})`);
        grd.addColorStop(0.7,  `rgba(${r},${g},${b},${(a * 0.7).toFixed(3)})`);
        grd.addColorStop(1,    `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
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
