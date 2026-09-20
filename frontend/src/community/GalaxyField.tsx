import { useEffect, useRef } from 'react';

/**
 * A deep-space field for the dark areas of the site.
 *
 * Three depth layers plus two nebula glows, drawn on a 2D canvas. Written
 * from scratch — the reference page returns 403 to anything that is not a
 * browser, and copying an implementation would be the wrong thing to do
 * regardless.
 *
 * WHY IT IS NOT ONE CANVAS FOR THE WHOLE PAGE
 * A single fixed background was the obvious architecture and does not work
 * here: body, .hero and .section-alt all paint opaque backgrounds, so a
 * canvas behind them would be invisible on every screen. Making it visible
 * would mean lightening those surfaces, which is a redesign. Instead one
 * instance sits in each genuinely dark region — the hero and the closing
 * band — and every instance stops rendering the moment it leaves the
 * viewport. In practice at most one is ever running, so the cost is that of
 * a single animation while the atmosphere stays continuous through the
 * places it can actually be seen.
 *
 * COST
 * Nothing is added to the dependency tree: 2D canvas, no WebGL, no library.
 * Per-frame state lives in closures, never in React, so the component
 * renders once and never again. Guards, in order of how much they save:
 * stop when off-screen, stop when the tab is hidden, cap device pixel ratio,
 * scale the particle count to the area, and on reduced motion draw a single
 * frame and never start the loop.
 */

type Intensity = 'hero' | 'band';

interface Props {
  /** 'band' is the lighter mix used in the closing section. */
  intensity?: Intensity;
}

interface Particle {
  angle: number;
  radius: number;
  depth: number;   // 0 far … 1 near
  size: number;
  drift: number;
  twinkle: number;
  twinkleRate: number;
  bright: boolean;
}

const TAU = Math.PI * 2;

/**
 * Per-device budgets. A phone is not given a thinned desktop configuration —
 * it gets fewer particles, a lower pixel ratio, slower movement and no
 * foreground glow, because glow is the most expensive thing here.
 */
const BUDGET = {
  desktop: { area: 5200, min: 130, max: 340, dpr: 2, speed: 1, glow: true },
  mobile: { area: 11000, min: 45, max: 110, dpr: 1.5, speed: 0.65, glow: false },
};

/** Proportions of the three layers. They must sum to 1. */
const LAYERS = [
  { share: 0.62, depth: [0.10, 0.34], size: [0.45, 0.95], alpha: 0.34 }, // far
  { share: 0.31, depth: [0.34, 0.70], size: [0.75, 1.5], alpha: 0.52 },  // middle
  { share: 0.07, depth: [0.70, 1.00], size: [1.3, 2.3], alpha: 0.85 },   // near
];

export default function GalaxyField({ intensity = 'hero' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    // A browser without 2D canvas gets the CSS gradient underneath and
    // nothing else — the background is never a dependency for the page.
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(max-width: 900px)');

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let rotation = 0;
    let resizeTimer = 0;

    const budget = () => (coarse.matches ? BUDGET.mobile : BUDGET.desktop);

    const build = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;

      const { area, min, max, dpr: dprCap } = budget();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

      width = Math.round(box.width);
      height = Math.round(box.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const total = Math.round(Math.min(max, Math.max(min, (width * height) / area)));
      const spread = Math.hypot(width, height);
      const next: Particle[] = [];

      LAYERS.forEach((layer, index) => {
        const count = Math.round(total * layer.share);
        for (let i = 0; i < count; i++) {
          const depth = layer.depth[0] + Math.random() * (layer.depth[1] - layer.depth[0]);
          next.push({
            angle: Math.random() * TAU,
            // Square-rooted so the scatter is even across the disc rather
            // than bunched at the centre, which a uniform radius gives.
            radius: Math.sqrt(Math.random()) * spread * 0.78,
            depth,
            size: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
            drift: 0.0014 + Math.random() * 0.0016,
            twinkle: Math.random() * TAU,
            // Slow and all slightly different, so nothing ever pulses in time.
            twinkleRate: 0.0006 + Math.random() * 0.0011,
            bright: index === 2 && Math.random() < 0.4,
          });
        }
      });
      particles = next;
    };

    /** Two soft lights, well off-centre, redrawn each frame under the stars. */
    const nebula = (t: number) => {
      const glows = [
        { x: 0.22, y: 0.1, r: 0.85, hue: '120, 150, 255', a: 0.16, rate: 0.00005 },
        { x: 0.82, y: 0.68, r: 0.7, hue: '90, 190, 240', a: 0.11, rate: -0.00004 },
      ];
      for (const glow of glows) {
        const wobble = Math.sin(t * glow.rate) * 0.04;
        const cx = width * (glow.x + wobble);
        const cy = height * (glow.y - wobble * 0.6);
        const radius = Math.max(width, height) * glow.r;
        const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(${glow.hue}, ${glow.a})`);
        gradient.addColorStop(1, `rgba(${glow.hue}, 0)`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }
    };

    // The centre of rotation sits above the section, so what is visible is
    // the lower arc of a much larger turn. That is what stops it reading as
    // a pinwheel spinning in a box.
    const draw = (delta: number, elapsed: number) => {
      const { speed, glow } = budget();
      context.clearRect(0, 0, width, height);
      nebula(elapsed);

      rotation += delta * 0.0000135 * speed;
      const cx = width * 0.5;
      const cy = -height * 0.4;
      const spread = Math.hypot(width, height);
      const softer = intensity === 'band' ? 0.55 : 1;

      for (const p of particles) {
        // Nearer particles swing further for the same turn: parallax.
        const angle = p.angle + rotation * (0.35 + p.depth);
        const x = cx + Math.cos(angle) * p.radius;
        const y = cy + Math.sin(angle) * p.radius * 0.6;

        p.radius += delta * p.drift * p.depth * speed;
        if (p.radius > spread * 0.82) {
          p.radius = spread * 0.06 * Math.random();
          p.angle = Math.random() * TAU;
        }

        if (x < -8 || x > width + 8 || y < -8 || y > height + 8) continue;

        p.twinkle += delta * p.twinkleRate;
        const flicker = 0.7 + Math.sin(p.twinkle) * 0.3;
        const layer = LAYERS[p.depth < 0.34 ? 0 : p.depth < 0.7 ? 1 : 2];
        // Fade towards the bottom, where the copy sits. Contrast behind the
        // text comes from this rather than from a panel behind the words.
        const depthFade = 1 - (y / height) * 0.5;
        const alpha = Math.max(0, layer.alpha * flicker * depthFade * softer);

        if (p.bright && glow) {
          context.shadowBlur = 6;
          context.shadowColor = `rgba(190, 220, 255, ${alpha * 0.8})`;
        }
        context.beginPath();
        context.arc(x, y, p.size, 0, TAU);
        context.fillStyle = `rgba(216, 233, 255, ${alpha.toFixed(3)})`;
        context.fill();
        if (p.bright && glow) context.shadowBlur = 0;
      }
    };

    let previous = performance.now();
    const tick = (now: number) => {
      // Clamped so a backgrounded tab returning does not jump the field
      // forward by however long it was away.
      const delta = Math.min(now - previous, 64);
      previous = now;
      draw(delta, now);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || motionQuery.matches || document.hidden) return;
      running = true;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    build();
    draw(0, 0);

    let onScreen = false;
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start(); else stop();
    }, { threshold: 0 });
    seen.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Rebuilding reallocates every particle, so it waits until the resize
    // has actually finished rather than running on each of the hundred
    // events a dragged window corner produces.
    const resized = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { build(); draw(0, performance.now()); }, 150);
    });
    resized.observe(canvas);

    const onMotionChange = () => {
      if (motionQuery.matches) { stop(); build(); draw(0, 0); }
      else if (onScreen) start();
    };
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      seen.disconnect();
      resized.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, [intensity]);

  return <canvas className="galaxy" ref={canvasRef} aria-hidden="true" />;
}
