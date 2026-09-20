import { useRef, useState } from 'react';
import { work } from '../content/communityContent';
import { trackEvent } from '../analytics';
import SafeImage from './SafeImage';
import Icon from '../components/Icon';

/** The domain, without the scheme or a trailing slash — what a browser shows. */
function displayHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * The projects as a showcase rather than a grid of equal cards.
 *
 * A grid asks the visitor to read three cards and compare them. A showcase
 * asks them to pick one and look at it, which is how someone actually
 * assesses work — and it gives each project the whole width instead of a
 * third of it.
 *
 * Built as a real tablist: arrow keys move between projects, Home and End
 * jump to the ends, and only the selected tab is in the tab order, which is
 * the behaviour a screen reader user expects from this pattern and the part
 * most implementations skip.
 *
 * The preview is a browser frame. Until a screenshot exists it shows the
 * address bar and the project's own highlights, which is honest — it is
 * plainly a placeholder rather than a picture of something that does not
 * exist. When the file lands it fills the frame.
 */
export default function WorkShowcase() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const item = work[active];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = work.length - 1;
    let next = active;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;

    event.preventDefault();
    setActive(next);
    // Selection follows focus in this pattern, so move focus with it.
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div className="showcase">
      <div
        className="showcase-tabs"
        role="tablist"
        aria-label="Projects"
        aria-orientation="vertical"
        ref={tabsRef}
        onKeyDown={onKeyDown}
      >
        {work.map((project, index) => (
          <button
            key={project.name}
            type="button"
            role="tab"
            id={`work-tab-${index}`}
            aria-selected={index === active}
            aria-controls="work-panel"
            tabIndex={index === active ? 0 : -1}
            className={`showcase-tab ${index === active ? 'is-active' : ''}`}
            onClick={() => setActive(index)}
          >
            <span className="showcase-tab-n" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="showcase-tab-text">
              <strong>{project.name}</strong>
              <small>{project.type}</small>
            </span>
            {project.status === 'preview' && (
              <span className="showcase-tab-flag">In review</span>
            )}
          </button>
        ))}
      </div>

      <div
        className="showcase-panel"
        role="tabpanel"
        id="work-panel"
        aria-labelledby={`work-tab-${active}`}
        tabIndex={0}
        // Keyed so the panel remounts and its entrance animation runs again
        // on every change — without it the content swaps with no transition
        // and the interaction feels like nothing happened.
        key={item.name}
      >
        <div className="showcase-browser">
          <div className="showcase-chrome" aria-hidden="true">
            <span className="showcase-dot" />
            <span className="showcase-dot" />
            <span className="showcase-dot" />
            <span className="showcase-address">{displayHost(item.url)}</span>
          </div>

          <div className="showcase-viewport">
            {item.image ? (
              <SafeImage
                src={item.image.src}
                alt={item.image.alt}
                width={1200}
                height={750}
              />
            ) : null}
            <ul className="showcase-highlights">
              {item.highlights.map((highlight) => (
                <li key={highlight}>
                  <Icon name="check-circle" size={15} />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="showcase-meta">
          <div>
            <h3>{item.name}</h3>
            <p>{item.sector}</p>
          </div>
          <a
            className="btn btn-primary"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('community_work_click', { project: item.name })}
          >
            {item.status === 'preview' ? 'View the preview' : 'Visit the site'}
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
