import { useCallback, useEffect, useRef, useState } from 'react';
import { pipeline } from '../content/communityContent';
import Icon from '../components/Icon';

/**
 * The hero panel: a vertical chain on a wide screen, a self-advancing
 * carousel on a phone.
 *
 * Same markup for both. Nothing here asks the browser what size it is —
 * the stylesheet decides whether the track lays out as a column or a row,
 * and the carousel behaviour switches itself on only when the track is
 * genuinely wider than its box. One source of truth for the breakpoint,
 * and it cannot drift from the CSS.
 *
 * It stops advancing the moment the visitor touches it, and never starts
 * again. Something that keeps moving under your finger after you have taken
 * hold of it feels broken, and a carousel that steals the card you were
 * reading is worse than no carousel.
 */
export default function HeroPipeline() {
  const trackRef = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const [isCarousel, setIsCarousel] = useState(false);
  const [held, setHeld] = useState(false);

  // Carousel only where the row actually overflows — which is the phone.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setIsCarousel(track.scrollWidth > track.clientWidth + 4);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Follow the scroll position so the dots always match what is on screen,
  // including when the visitor swipes rather than taps.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isCarousel) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = track.firstElementChild as HTMLElement | null;
        if (!card) return;
        const step = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
        setIndex(Math.round(track.scrollLeft / step));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isCarousel]);

  const goTo = useCallback((next: number) => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollTo({ left: step * next, behavior: 'smooth' });
  }, []);

  // Advance on its own until touched.
  useEffect(() => {
    if (!isCarousel || held) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % pipeline.length;
        goTo(next);
        return next;
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isCarousel, held, goTo]);

  const hold = () => setHeld(true);

  return (
    <div className="pipeline-panel">
      <p className="pipeline-title">Everywhere a customer looks for you</p>

      <ol
        className="pipeline"
        ref={trackRef}
        onPointerDown={hold}
        onTouchStart={hold}
        onWheel={hold}
      >
        {pipeline.map((step, i) => (
          <li
            className={`pipeline-step ${isCarousel && i === index ? 'is-current' : ''}`}
            key={step.title}
          >
            <span className="pipeline-icon"><Icon name={step.icon} size={17} /></span>
            <span className="pipeline-text">
              <strong>{step.title}</strong>
              <small>{step.body}</small>
            </span>
          </li>
        ))}
      </ol>

      {isCarousel && (
        <div className="pipeline-dots" role="tablist" aria-label="Pipeline steps">
          {pipeline.map((step, i) => (
            <button
              key={step.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={step.title}
              className={`pipeline-dot ${i === index ? 'is-current' : ''}`}
              onClick={() => { hold(); setIndex(i); goTo(i); }}
            />
          ))}
        </div>
      )}

      <p className="pipeline-foot">Built together, handed over in your name.</p>
    </div>
  );
}
