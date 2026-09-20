import { useEffect, useRef } from 'react';

/**
 * A slowly rotating starfield behind the hero.
 *
 * Written from scratch rather than lifted from anywhere: stars scattered in a
 * disc, turning around a centre that sits off the top of the section, each
 * one drifting outward and respawning near the middle. Depth does the rest —
 * a star's z decides its size, its brightness and how fast it moves, so the
 * near ones sweep past the far ones and the field reads as a volume rather
 * than a texture.
 *
 * Canvas rather than DOM: a few hundred elements each with their own
 * transform would spend more time in layout than this spends drawing, and
 * 2D canvas rather than WebGL because nothing here needs a shader and a
 * WebGL context is a far larger thing to fail on an old phone.
 *
 * What it costs is taken seriously, because most of this audience is on a
 * mid-range Android:
 *   - the loop stops when the hero scrolls out of view, and when the tab is
 *     hidden, so it never burns battery behind another window
 *   - device pixel ratio is capped at 2; a 3x phone gains nothing visible
 *     from nine times the pixels
 *   - the star count follows the area, so a phone draws a fraction of what a
 *     desktop does
 *   - reduced motion draws one frame and stops
 */

interface Star {
  angle: number;
  radius: number;
  z: number;
  twinkle: number;
}

const TAU = Math.PI * 2;

export default function GalaxyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let running = false;
    let rotation = 0;

    const build = () => {
      const box = canvas.getBoundingClientRect();
      // A 3x screen gains nothing visible here and costs nine times the fill.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Roughly one star per 4,000 square pixels, bounded at both ends so a
      // phone is not bare and a wide desktop is not a snowstorm.
      const count = Math.round(Math.min(320, Math.max(90, (width * height) / 4000)));
      const spread = Math.hypot(width, height);

      stars = Array.from({ length: count }, () => ({
        angle: Math.random() * TAU,
        // Square-rooted so the stars spread evenly across the disc instead of
        // bunching towards the middle, which is what a uniform radius gives.
        radius: Math.sqrt(Math.random()) * spread * 0.75,
        z: 0.25 + Math.random() * 0.75,
        twinkle: Math.random() * TAU,
      }));
    };

    // The centre of rotation sits above the section, so the visible part is
    // the lower arc of a much larger turn — which is what stops it reading
    // as a pinwheel.
    const centreX = () => width * 0.5;
    const centreY = () => -height * 0.35;

    const draw = (delta: number) => {
      context.clearRect(0, 0, width, height);
      rotation += delta * 0.000018;

      const cx = centreX();
      const cy = centreY();
      const spread = Math.hypot(width, height);

      for (const star of stars) {
        // Nearer stars swing further for the same turn, which is what gives
        // the field its depth.
        const angle = star.angle + rotation * (0.4 + star.z);
        const x = cx + Math.cos(angle) * star.radius;
        const y = cy + Math.sin(angle) * star.radius * 0.62;

        star.radius += delta * 0.0022 * star.z;
        if (star.radius > spread * 0.8) {
          star.radius = spread * 0.08 * Math.random();
          star.angle = Math.random() * TAU;
        }

        if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;

        star.twinkle += delta * 0.0013;
        const flicker = 0.72 + Math.sin(star.twinkle) * 0.28;
        const size = star.z * 1.5;
        // Fade towards the bottom of the section, where the copy sits.
        const depthFade = 1 - (y / height) * 0.55;
        const alpha = Math.max(0, star.z * 0.62 * flicker * depthFade);

        context.beginPath();
        context.arc(x, y, size, 0, TAU);
        context.fillStyle = `rgba(214, 232, 255, ${alpha.toFixed(3)})`;
        context.fill();
      }
    };

    let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(now - previous, 64);
      previous = now;
      draw(delta);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced) return;
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
    draw(0);
    if (reduced) return undefined;

    // Only animate while it is actually on screen.
    const seen = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    seen.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const resized = new ResizeObserver(() => { build(); draw(0); });
    resized.observe(canvas);

    return () => {
      stop();
      seen.disconnect();
      resized.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas className="galaxy" ref={canvasRef} aria-hidden="true" />;
}
