import { useEffect, useRef, useState } from 'react';
import { sectionLinks } from '../../content/roadmapContent';
import { scrollToSection } from '../OfferHeader';

// Sticky in-page navigation. On desktop it sits under the site header; on
// mobile — where the site header is hidden by design — it becomes the page's
// jump-link bar, which is the main way phone visitors move around a page
// this long.
export default function RoadmapSectionNav() {
  const [activeId, setActiveId] = useState(sectionLinks[0].id);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = sectionLinks
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => !!element);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    sections.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  // Keep the active pill in view on narrow screens, where the bar scrolls.
  // Deliberately not scrollIntoView: that would also scroll the *page* to bring
  // the bar itself into view on first render, hijacking the visitor's position.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('.section-nav-link.active');
    if (!list || !active) return;
    const target = active.offsetLeft - (list.clientWidth - active.clientWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [activeId]);

  return (
    <nav className="section-nav" aria-label="Roadmap sections">
      <div className="container">
        <div className="section-nav-list" ref={listRef}>
          {sectionLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`section-nav-link ${activeId === link.id ? 'active' : ''}`}
              aria-current={activeId === link.id ? 'true' : undefined}
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
