import { useEffect, useRef } from 'react';

// A hairline at the very top showing how far through the page the visitor is.
// Written straight to the DOM node rather than through state: this fires on
// every scroll frame, and re-rendering React that often for two pixels of
// paint is wasted work.
export default function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}
