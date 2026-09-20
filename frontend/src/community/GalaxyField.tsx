import { useEffect, useRef } from 'react';

/**
 * A spiral galaxy built from particles.
 *
 * Structure, not scatter. Particles are placed along logarithmic spiral arms
 * rather than sprinkled across the box, which is the whole difference
 * between this and a starfield: the arms are what the eye recognises.
 *
 * GEOMETRY
 * Each arm is a logarithmic spiral, θ = ln(r / r0) / tan(pitch), the curve
 * every real galaxy approximates. Particles are placed by radius and pushed
 * onto their arm's curve, then scattered perpendicular to it by an amount
 * that grows with radius, so the arms are tight near the core and fray at
 * the edges the way they actually do. Every arm gets its own length, pitch,
 * density and brightness, because four identical arms read as a pinwheel.
 * A disc population fills the gaps between arms so the space between is
 * sparse rather than empty, and a far field of almost-static stars sits
 * behind the whole thing.
 *
 * The core is density, not a gradient: several hundred particles inside a
 * small radius, a handful of them bright. No glowing ball.
 *
 * MOTION
 * Differential rotation — one shared clock, and angular velocity falls with
 * radius, so the core turns while the outer arms barely move. This is what
 * keeps the structure coherent: nothing has its own velocity, so the arms
 * cannot come apart. A minute per-particle wobble stops it looking machined.
 *
 * RENDERING
 * Particles are drawn from four pre-rendered sprites rather than as arcs. An
 * arc plus fill per particle is the thing that makes canvas galaxies slow;
 * drawImage of a small cached bitmap is several times cheaper and gives a
 * soft falloff for free, which is what lets this carry 1,400 particles where
 * the previous version managed 340.
 *
 * WHY NOT ONE CANVAS FOR THE PAGE
 * body, .hero and .section-alt all paint opaque backgrounds, so a fixed
 * page-wide canvas would be invisible everywhere. One instance sits in each
 * dark region and every instance stops when off screen, so at most one runs.
 */

type Intensity = 'hero' | 'band';

interface Props {
  intensity?: Intensity;
}

interface Particle {
  angle: number;      // current angle around the core
  radius: number;     // distance from the core, in px at build time
  speed: number;      // angular velocity, set by radius
  sprite: number;     // which of the four tints
  size: number;
  alpha: number;
  wobble: number;     // phase for the individual drift
  wobbleRate: number;
  flicker: number;    // how much its brightness moves, mostly near zero
}

const TAU = Math.PI * 2;

/**
 * Per-device budgets. The phone is a different composition, not a cropped
 * desktop one: fewer particles, but each slightly larger so the spiral is
 * still legible at 390px.
 */
const BUDGET = {
  // reach multiplies the base radius, which is bounded by BOTH dimensions —
  // see the formula in build(). Keying it off one dimension gave 61% of the
  // width at 1440px and 88% at 390px, because a phone is tall and narrow and
  // a desktop is not.
  desktop: { total: 1400, dpr: 2, sizeScale: 1, reach: 1, glow: true },
  mobile: { total: 520, dpr: 1.5, sizeScale: 1.35, reach: 1, glow: false },
};

/**
 * Four arms of different lengths. Identical arms read as a pinwheel, so each
 * one gets its own pitch, extent, share of the particles and brightness.
 */
const ARMS = [
  { offset: 0.00, pitch: 0.42, reach: 1.00, share: 0.30, bright: 1.00 },
  { offset: 1.62, pitch: 0.38, reach: 0.82, share: 0.24, bright: 0.85 },
  { offset: 3.05, pitch: 0.46, reach: 0.94, share: 0.26, bright: 0.95 },
  { offset: 4.55, pitch: 0.36, reach: 0.64, share: 0.20, bright: 0.78 },
];

/** White, warm white, pale blue, and a rare faint gold. Nothing saturated. */
const TINTS = ['255, 255, 255', '255, 246, 232', '214, 230, 255', '255, 226, 178'];

function makeSprite(tint: string): HTMLCanvasElement {
  const size = 16;
  const sprite = document.createElement('canvas');
  sprite.width = size; sprite.height = size;
  const ctx = sprite.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${tint}, 1)`);
    gradient.addColorStop(0.35, `rgba(${tint}, 0.55)`);
    gradient.addColorStop(1, `rgba(${tint}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return sprite;
}

export default function GalaxyField({ intensity = 'hero' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    // Without a 2D context nothing renders and the CSS gradient underneath
    // stands alone — the background is never required for the page to work.
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 900px)');
    const sprites = TINTS.map(makeSprite);

    let particles: Particle[] = [];
    let width = 0; let height = 0;
    let cx = 0; let cy = 0;
    let frame = 0; let running = false;
    let rotation = 0;
    let reveal = 0;          // 0 … 1, driven by how far into view the section is
    let resizeTimer = 0;

    const budget = () => (small.matches ? BUDGET.mobile : BUDGET.desktop);

    const build = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;

      const { total, dpr: dprCap, sizeScale, reach } = budget();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      width = Math.round(box.width);
      height = Math.round(box.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Off centre, because a galaxy pinned to the middle of a box looks
      // placed rather than photographed.
      cx = width * (intensity === 'band' ? 0.7 : 0.44);
      cy = height * 0.42;

      // Bounded by both dimensions, so the galaxy keeps the same share of the
      // frame whatever its shape: about two thirds of the width on a phone, a
      // laptop and a desktop alike, with dark space around it either way.
      const outer = Math.min(width * 0.33, height * 0.72) * reach;
      const core = outer * 0.055;
      const next: Particle[] = [];

      const push = (radius: number, angle: number, weight: number) => {
        // 74% barely there, 21% visible, 5% bright. Brightness is mostly
        // what carries depth, so the distribution matters more than size.
        const roll = Math.random();
        const tier = roll < 0.74 ? 0 : roll < 0.95 ? 1 : 2;
        const tint = Math.random() < 0.04 ? 3 : Math.random() < 0.3 ? 2 : Math.random() < 0.5 ? 1 : 0;
        const base = [0.9, 1.5, 2.4][tier] * sizeScale;
        const alpha = [0.2, 0.42, 0.85][tier] * weight;

        next.push({
          angle,
          radius,
          // Falls with radius: the core turns, the rim hardly does. Softened
          // by the constant so the very centre does not spin.
          speed: 1 / (0.45 + (radius / outer) * 2.6),
          sprite: tint,
          size: base * (0.75 + Math.random() * 0.6),
          alpha: alpha * (0.6 + Math.random() * 0.55),
          wobble: Math.random() * TAU,
          wobbleRate: 0.0002 + Math.random() * 0.0004,
          flicker: tier === 2 ? 0.22 : 0.08,
        });
      };

      // --- Arms: the structure ---------------------------------------
      const armTotal = Math.round(total * 0.62);
      for (const arm of ARMS) {
        const count = Math.round(armTotal * arm.share);
        for (let i = 0; i < count; i++) {
          // Biased inward so the arms thicken towards the core.
          const t = Math.pow(Math.random(), 1.7);
          const radius = core + t * (outer * arm.reach - core);
          // Logarithmic spiral: the curve real arms approximate.
          const theta = Math.log(radius / core) / Math.tan(arm.pitch);
          // Scatter grows with radius, so arms are tight in and frayed out.
          const spread = 0.055 + (radius / outer) * 0.3;
          const jitter = (Math.random() + Math.random() - 1) * spread;
          push(radius * (1 + (Math.random() - 0.5) * 0.06), arm.offset + theta + jitter, arm.bright);
        }
      }

      // --- Disc: keeps the space between arms sparse, not empty -------
      const discCount = Math.round(total * 0.16);
      for (let i = 0; i < discCount; i++) {
        const radius = core + Math.pow(Math.random(), 1.3) * (outer - core);
        push(radius, Math.random() * TAU, 0.55);
      }

      // --- Core: density, never a gradient ----------------------------
      const coreCount = Math.round(total * 0.14);
      for (let i = 0; i < coreCount; i++) {
        const radius = Math.pow(Math.random(), 0.55) * core * 3.4;
        push(radius, Math.random() * TAU, 1.15);
      }

      // --- Far field: almost stationary, behind everything ------------
      const farCount = Math.round(total * 0.08);
      for (let i = 0; i < farCount; i++) {
        next.push({
          angle: Math.random() * TAU,
          radius: outer * (1.05 + Math.random() * 1.1),
          speed: 0.05,
          sprite: Math.random() < 0.2 ? 2 : 0,
          size: (0.7 + Math.random() * 0.5) * sizeScale,
          alpha: 0.1 + Math.random() * 0.14,
          wobble: Math.random() * TAU,
          wobbleRate: 0.0002,
          flicker: 0.05,
        });
      }

      particles = next;
    };

    /**
     * How much of the section is on screen, eased. The galaxy arrives as the
     * visitor reaches it rather than being permanently on.
     */
    const updateReveal = () => {
      const box = canvas.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // Fully in once the section covers the middle band of the viewport.
      const visible = Math.min(box.bottom, viewport) - Math.max(box.top, 0);
      const ratio = Math.max(0, Math.min(1, visible / Math.min(box.height, viewport * 0.72)));
      reveal += (ratio - reveal) * 0.08;   // eased, so it never snaps
    };

    const draw = (delta: number) => {
      const { glow } = budget();
      context.clearRect(0, 0, width, height);
      updateReveal();
      if (reveal < 0.01) return;

      // One clock for the whole galaxy. Slow: a full turn of the core takes
      // minutes, which is what "majestic" means in numbers.
      rotation += delta * 0.0000115;
      const tilt = 0.42;                    // the disc seen at an angle
      const dim = intensity === 'band' ? 0.6 : 1;

      for (const p of particles) {
        p.wobble += delta * p.wobbleRate;
        const angle = p.angle + rotation * p.speed + Math.sin(p.wobble) * 0.012;
        const x = cx + Math.cos(angle) * p.radius;
        const y = cy + Math.sin(angle) * p.radius * tilt;

        const size = p.size;
        if (x < -size || x > width + size || y < -size || y > height + size) continue;

        const alpha = p.alpha * (1 - p.flicker + Math.sin(p.wobble * 3) * p.flicker) * reveal * dim;
        if (alpha <= 0.004) continue;

        context.globalAlpha = alpha;
        const drawn = size * (glow ? 3.4 : 3);
        context.drawImage(sprites[p.sprite], x - drawn / 2, y - drawn / 2, drawn, drawn);
      }
      context.globalAlpha = 1;
    };

    let previous = performance.now();
    const tick = (now: number) => {
      // Clamped so returning to a hidden tab does not jump the rotation.
      const delta = Math.min(now - previous, 64);
      previous = now;
      draw(delta);
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

    const still = () => { reveal = 1; draw(0); };

    build();
    if (motionQuery.matches) still(); else draw(0);

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

    // A rebuild reallocates every particle, so it waits for the resize to
    // finish rather than running on each event a dragged corner produces.
    const resized = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (motionQuery.matches) still(); else draw(0);
      }, 160);
    });
    resized.observe(canvas);

    const onMotionChange = () => {
      if (motionQuery.matches) { stop(); still(); }
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
