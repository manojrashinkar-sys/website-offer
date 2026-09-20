import { useEffect, useRef } from 'react';

type Props = { intensity?: 'hero' | 'band' | 'background'; surface?: 'dark' | 'theme' };
type Particle = {
  along: number; offset: number; depth: number; phase: number;
  size: number; alpha: number; tint: number; fieldX: number; fieldY: number;
};

// An open, upright coil with a long ascending tail, sampled as a smooth 3D
// ribbon. The silhouette is deliberately asymmetric; it is not a rotating disc.
const KNOTS = [
  [0, .32], [.10, .25], [.19, .34], [.13, .48], [-.08, .50],
  [-.25, .35], [-.25, .12], [-.06, -.02], [.23, .04], [.44, .27],
  [.47, .58], [.25, .81], [-.09, .83], [-.43, .62], [-.63, .27],
  [-.62, -.15], [-.47, -.56], [-.15, -.91], [.24, -1.06], [.65, -1.02],
];
const SAMPLES = 2048;
const TAU = Math.PI * 2;
const TINTS = ['248,252,255', '113,178,210', '208,155,65'];
const COLORS = TINTS.map(tint => `rgb(${tint})`);
const LIGHT_TINTS = ['44,69,101', '38,105,145', '148,105,41'];
const LIGHT_COLORS = LIGHT_TINTS.map(tint => `rgb(${tint})`);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };

function ribbon() {
  const points = new Float32Array((SAMPLES + 1) * 3);
  for (let i = 0; i <= SAMPLES; i++) {
    const at = i / SAMPLES * (KNOTS.length - 1);
    const n = Math.min(KNOTS.length - 2, Math.floor(at));
    const t = at - n;
    for (let axis = 0; axis < 2; axis++) {
      const a = KNOTS[Math.max(0, n - 1)][axis];
      const b = KNOTS[n][axis];
      const c = KNOTS[n + 1][axis];
      const d = KNOTS[Math.min(KNOTS.length - 1, n + 2)][axis];
      points[i * 3 + axis] = .5 * ((2 * b) + (-a + c) * t
        + (2 * a - 5 * b + 4 * c - d) * t * t
        + (-a + 3 * b - 3 * c + d) * t * t * t);
    }
    points[i * 3 + 2] = Math.sin(i / SAMPLES * TAU * 1.6) * .24;
  }
  return points;
}

function sprite(tint: string) {
  const bitmap = document.createElement('canvas');
  bitmap.width = bitmap.height = 32;
  const ctx = bitmap.getContext('2d')!;
  const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, `rgba(${tint},1)`);
  glow.addColorStop(.14, `rgba(${tint},.95)`);
  glow.addColorStop(.30, `rgba(${tint},.42)`);
  glow.addColorStop(.6, `rgba(${tint},.08)`);
  glow.addColorStop(1, `rgba(${tint},0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 32, 32);
  return bitmap;
}

/** Kept at the existing integration points so it never alters content/layout. */
export default function ParticleRibbon({ intensity = 'hero', surface = 'dark' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 900px)');
    const path = ribbon();
    const sprites = TINTS.map(sprite);
    const lightSprites = surface === 'theme' ? LIGHT_TINTS.map(sprite) : sprites;
    let light = surface === 'theme' && document.documentElement.dataset.theme !== 'dark';
    let particles: Particle[] = [];
    let width = 0, height = 0, dpr = 1;
    let frame = 0, resizeTimer = 0, visible = false;
    let clock = 0, previous = 0, lastDraw = 0;
    let scrollTarget = 0, scroll = 0;
    let wash: CanvasGradient;

    function build() {
      const box = canvas!.getBoundingClientRect();
      width = Math.round(box.width); height = Math.round(box.height);
      if (!width || !height) return;
      dpr = Math.min(devicePixelRatio || 1, mobile.matches ? 1.5 : 2, Math.sqrt(3000000 / (width * height)));
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Stable sampling across resizes and React remounts, with no random jumps.
      let seed = 71821;
      const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      const count = intensity === 'background' ? (mobile.matches ? 140 : 280) : (mobile.matches ? 1250 : 2600);
      particles = Array.from({ length: count }, (_, i) => {
        const bright = random();
        const tint = bright > .92 ? 0 : random() < .65 ? 1 : random() < .55 ? 0 : 2;
        return {
          along: i / count,
          offset: (random() + random() + random() - 1.5),
          depth: random() * 2 - 1,
          phase: random() * TAU,
          size: bright > .985 ? 3.5 + random() * 2 : bright > .92 ? 1.5 + random() * 1.5 : .45 + random() * .65,
          alpha: bright > .92 ? .72 + random() * .28 : .23 + random() * .48,
          tint,
          fieldX: random(), fieldY: random(),
        };
      });
      // A transparent contrast veil retains the existing aurora's motion but
      // gives tiny points a dark ground and keeps text readable.
      wash = context!.createRadialGradient(width * .5, height * .5, 0, width * .5, height * .5, width * .8);
      wash.addColorStop(0, 'rgba(2,6,10,.84)');
      wash.addColorStop(1, 'rgba(3,9,15,.42)');
      measureScroll();
    }

    function measureScroll() {
      const box = canvas!.getBoundingClientRect();
      // Normal document scroll opens the coil; no scroll capture or spacer.
      scrollTarget = ease(-box.top / Math.max(1, height * .72));
    }

    function draw() {
      if (!width || !height) return;
      context!.clearRect(0, 0, width, height);
      if (intensity !== 'background') {
        context!.fillStyle = wash;
        context!.fillRect(0, 0, width, height);
      }
      const quiet = reduced.matches;
      const t = quiet ? 0 : clock;
      const spread = quiet ? 0 : scroll;
      // Fit each axis to the section so a short, wide desktop hero does not
      // squeeze the whole formation into the card on the right.
      const scaleX = width * .70;
      const scaleY = height * .48;
      const cx = width * .5;
      const cy = height * .53;
      const yaw = Math.sin(t * .13) * .24;
      const turn = Math.sin(t * .09) * .09;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cosR = Math.cos(turn), sinR = Math.sin(turn);
      const dim = intensity === 'background' ? (light ? .58 : .65) : intensity === 'band' ? .66 : 1;
      const palette = light ? LIGHT_COLORS : COLORS;
      const dots = light ? lightSprites : sprites;
      context!.globalCompositeOperation = light ? 'source-over' : 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Supporting sections get only sparse specks, not repeated coils.
        const ambient = intensity === 'background' || i % 9 === 0;
        const u = (p.along + t * .007) % 1;
        const idx = Math.floor(u * SAMPLES) * 3;
        const widthAt = .009 + Math.sin(u * Math.PI) * .046;
        const strand = Math.sin(p.phase + u * 19 + t * .22);
        const x0 = path[idx] + p.offset * widthAt + strand * .012;
        const y0 = path[idx + 1] + Math.cos(p.phase) * widthAt * .65;
        const z = path[idx + 2] + p.depth * .15;
        const x1 = x0 * cosY + z * sinY;
        const depth = z * cosY - x0 * sinY;
        const perspective = 2.8 / (2.8 - depth);
        const x = (x1 * cosR - y0 * sinR) * perspective;
        const y = (x1 * sinR + y0 * cosR) * perspective;
        // The same points move into a sparse peripheral field on scroll.
        const fieldX = (p.fieldX < .5 ? p.fieldX * .64 : .68 + (p.fieldX - .5) * .64) * width;
        const fieldY = p.fieldY * height;
        const blend = ambient ? 1 : spread;
        const px = (cx + x * scaleX * (1 + spread * .7)) * (1 - blend) + fieldX * blend;
        const py = (cy + y * scaleY * (1 + spread * .7)) * (1 - blend) + fieldY * blend;
        const taper = ease(u / .025) * ease((1 - u) / .06);
        const alpha = p.alpha * dim * (ambient ? .24 : taper * (1 - spread * .75));
        const diameter = p.size * perspective * (mobile.matches ? .85 : 1) * (ambient ? .7 : 1 - spread * .48);
        if (px < -8 || px > width + 8 || py < -8 || py > height + 8) continue;
        context!.globalAlpha = alpha;
        if (diameter < 1.35) {
          context!.fillStyle = palette[p.tint];
          context!.fillRect(px, py, diameter, diameter);
        } else {
          const size = diameter * 3;
          context!.drawImage(dots[p.tint], px - size / 2, py - size / 2, size, size);
        }
      }
      context!.globalAlpha = 1;
      context!.globalCompositeOperation = 'source-over';
    }

    function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    function tick(now: number) {
      frame = 0;
      if (!visible || document.hidden || reduced.matches) return;
      // Follow display refresh on desktop; cap phones at 30fps to save power.
      const interval = 1000 / 30;
      if (!mobile.matches || now - lastDraw >= interval - .5) {
        const dt = previous ? Math.min((now - previous) / 1000, .08) : 0;
        previous = now;
        // Keep the fractional remainder so the mobile cap does not drift.
        lastDraw = now - Math.max(0, (now - lastDraw) % interval);
        clock += dt;
        scroll += (scrollTarget - scroll) * (1 - Math.exp(-dt * 9));
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function start() {
      if (!frame && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
    }
    function visibility() { if (document.hidden) stop(); else start(); }
    function motion() { stop(); scroll = 0; draw(); start(); }
    function onScroll() { if (visible && !reduced.matches) measureScroll(); }
    const theme = new MutationObserver(() => {
      light = surface === 'theme' && document.documentElement.dataset.theme !== 'dark';
      if (visible || reduced.matches) draw();
    });
    if (surface === 'theme') theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    build(); draw();
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { measureScroll(); start(); } else stop();
    });
    intersection.observe(canvas);
    const resize = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { build(); draw(); }, 120);
    });
    resize.observe(canvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', motion);
    return () => {
      stop(); clearTimeout(resizeTimer);
      intersection.disconnect(); resize.disconnect(); theme.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', motion);
    };
  }, [intensity, surface]);
  return <canvas className="particle-ribbon" ref={canvasRef} aria-hidden="true" />;
}
