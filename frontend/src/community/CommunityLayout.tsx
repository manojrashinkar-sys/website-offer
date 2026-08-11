import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { navOrder, pages, venture } from '../content/communityContent';
import { useDiscussAction } from '../hooks/useDiscussAction';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import { communityPath } from './routing';
import Icon from '../components/Icon';
import ThemeToggle from '../components/ThemeToggle';
import ScrollProgress from '../components/ScrollProgress';
import MobileStickyActions from '../components/MobileStickyActions';
import WebsiteAdvisor from '../components/website-advisor/WebsiteAdvisor';

/**
 * One line under each drawer link. A bare list of six words makes the reader
 * guess; naming what is behind each one removes the guessing.
 */
const drawerHints: Record<string, string> = {
  home: 'Overview of what we do',
  about: 'How we work, and who you deal with',
  services: 'Websites, applications, redesigns, hosting',
  work: 'Projects we are permitted to show',
  process: 'The six stages of a project',
  contact: 'Start a conversation',
};

/**
 * Shell for the Web Services site.
 *
 * The offer page's header carries section jump-links for a single long page,
 * which is the wrong shape here — this is six separate pages, so it needs
 * real page navigation with a current-page state. Everything below the nav
 * (tokens, buttons, theme, assistant) is shared with the rest of the site.
 */
export default function CommunityLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const discuss = useDiscussAction('community_header');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Never carry an open drawer across a page change.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Keep the current tab visible in the scrolling strip. Landing on Contact
  // and seeing a strip that appears to start at Home is disorienting.
  //
  // Deliberately not scrollIntoView, for the same reason as the roadmap's
  // section nav: it scrolls *every* scrollable ancestor, not just the strip.
  // The last two tabs cannot be centred within the strip alone, so the
  // browser makes up the difference by scrolling the page itself sideways —
  // which on WebKit shifted the whole site left and cropped it. Writing
  // scrollLeft on the track can only ever move the track.
  useEffect(() => {
    const track = tabsRef.current;
    const active = track?.querySelector<HTMLElement>('.community-tab.active');
    if (!track || !active) return;
    // Instant, like the scrollIntoView it replaces: the strip should already
    // be in the right place for the page you land on, not slide there.
    const target = active.offsetLeft - (track.clientWidth - active.clientWidth) / 2;
    track.scrollLeft = Math.max(0, target);
  }, [location.pathname]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Lock the page behind the drawer, close on Escape, and keep Tab inside it.
  useEffect(() => {
    if (!menuOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((element) => element.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen, closeMenu]);

  /**
   * Light the card the pointer is over, from where the pointer is.
   *
   * One listener on the root rather than one per card — there are dozens of
   * cards across six pages — throttled to a frame, and it writes two custom
   * properties. The gradient itself is CSS, so nothing is styled from
   * JavaScript and nothing is measured on a frame that does not need it.
   *
   * Skipped entirely without a fine pointer: there is no cursor to follow on
   * a touchscreen, so the listener is never attached.
   */
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const root = rootRef.current;
    if (!root) return;

    const LIT = '.pillar-card, .capability-card, .work-card, .contact-route,'
      + ' .stage, .community-aside, .service-block';
    let frame = 0;
    let pending: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const event = pending;
      pending = null;
      const card = (event?.target as Element | null)?.closest?.(LIT) as HTMLElement | null;
      if (!card || !event) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      root.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /**
   * Navigate through the View Transitions API where the browser has it.
   *
   * The browser takes a snapshot of the old page and the new one and
   * interpolates between them, so the change is a genuine transition rather
   * than one thing disappearing while another appears. flushSync is required:
   * the callback has to leave the DOM in its final state before it returns,
   * and React would otherwise batch the update until afterwards.
   *
   * Where the API is missing the handler does nothing at all and the link
   * behaves normally, falling back to the CSS fade.
   */
  const withViewTransition = (to: string) => (event: React.MouseEvent) => {
    const start = (document as Document & {
      startViewTransition?: (cb: () => void) => void;
    }).startViewTransition;
    // Never hijack a modified click — that is the visitor asking for a new tab.
    if (!start || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (to === location.pathname) return;
    event.preventDefault();
    start.call(document, () => { flushSync(() => navigate(to)); });
  };

  const year = new Date().getFullYear();

  return (
    <div className="offer-page community-site" ref={rootRef}>
      <ScrollProgress />
      <a className="skip-link" href="#main">Skip to content</a>

      <header className={`offer-header community-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <NavLink className="brand community-brand" to={communityPath('home')} aria-label={`${venture.branch} — home`}>
            <span className="community-brand-mark" aria-hidden="true">
              <Icon name="layers" size={18} />
            </span>
            <span className="community-brand-text">
              <strong>{venture.branch}</strong>
              <small>{venture.parent}</small>
            </span>
          </NavLink>

          <nav className="header-nav community-nav" aria-label="Site pages">
            {navOrder.map((key) => (
              <NavLink
                key={key}
                to={communityPath(key)}
                end={key === 'home'}
                onClick={withViewTransition(communityPath(key))}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {pages[key].nav}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <ThemeToggle />
            {config.whatsappNumber && (
              <a
                className="header-contact-btn"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'community_header' })}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.02 2 11c0 2.44 1.08 4.65 2.84 6.27L4 22l4.98-1.6c.95.26 1.96.4 3.02.4 5.52 0 10-4.02 10-9S17.52 2 12 2zm-4 8h8v2H8v-2zm0-3h8v2H8V7zm0 6h5v2H8v-2z" />
                </svg>
              </a>
            )}

            <button className="btn btn-primary btn-sm header-cta" onClick={discuss}>
              Discuss a Project
            </button>

            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="community-mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={`menu-bars ${menuOpen ? 'open' : ''}`} aria-hidden="true">
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Phones lose the header nav entirely, which leaves the drawer as the
          only way to move between six pages. This strip keeps them one tap
          away and, being scrollable, does not force the labels to shrink. */}
      <nav className="community-tabs" aria-label="Pages">
        <div className="community-tabs-track" ref={tabsRef}>
          {navOrder.map((key) => (
            <NavLink
              key={key}
              to={communityPath(key)}
              end={key === 'home'}
              onClick={withViewTransition(communityPath(key))}
              className={({ isActive }) => `community-tab ${isActive ? 'active' : ''}`}
            >
              {pages[key].nav}
            </NavLink>
          ))}
        </div>
      </nav>

      {menuOpen && <div className="mobile-nav-backdrop" onClick={closeMenu} aria-hidden="true" />}

      <div
        id="community-mobile-nav"
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-head">
          <span className="community-brand-text">
            <strong>{venture.branch}</strong>
            <small>{venture.parent}</small>
          </span>
          <button type="button" className="mobile-nav-close" onClick={closeMenu} aria-label="Close menu">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="mobile-nav-body">
          <p className="mobile-nav-label">Pages</p>
          <div className="mobile-nav-group">
            {navOrder.map((key) => (
              <NavLink
                key={key}
                to={communityPath(key)}
                end={key === 'home'}
                className={({ isActive }) => `mobile-nav-link community-drawer-link ${isActive ? 'active' : ''}`}
              >
                <span className="community-drawer-text">
                  <strong>{pages[key].nav}</strong>
                  <small>{drawerHints[key]}</small>
                </span>
                <span className="mobile-nav-arrow" aria-hidden="true">→</span>
              </NavLink>
            ))}
          </div>

          <p className="mobile-nav-label">Appearance</p>
          <ThemeToggle variant="row" />
        </div>

        <div className="mobile-nav-foot">
          <button className="btn btn-primary" onClick={() => { setMenuOpen(false); discuss(); }}>
            Discuss a Project
          </button>

          <div className="mobile-nav-contact">
            {config.whatsappNumber && (
              <a
                className="mobile-nav-contact-link"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setMenuOpen(false);
                  trackEvent('promo_whatsapp_click', { placement: 'community_drawer' });
                }}
              >
                <Icon name="chat" size={16} />
                WhatsApp
              </a>
            )}
            {config.contactPhone && (
              <a
                className="mobile-nav-contact-link"
                href={`tel:${config.contactPhone}`}
                onClick={() => trackEvent('phone_click', { placement: 'community_drawer' })}
              >
                <Icon name="phone" size={16} />
                Call
              </a>
            )}
            {config.contactEmail && (
              <a className="mobile-nav-contact-link" href={`mailto:${config.contactEmail}`}>
                <Icon name="mail" size={16} />
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Keyed on the path so React remounts on navigation and the entrance
          animation runs again. Without the key the six pages would swap
          instantly, which on a site this fast reads as a flicker rather than
          a change of page. */}
      <main id="main">
        <div className="community-page-in" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <footer className="offer-footer community-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="footer-brand community-footer-brand">
                <strong>{venture.branch}</strong>
                <small>{venture.parent}</small>
              </h3>
              <p>{venture.tagline}.</p>
              {config.businessLocation && <p>{config.businessLocation}</p>}
            </div>

            <div>
              <h4>Pages</h4>
              <ul className="footer-links">
                {navOrder.map((key) => (
                  <li key={key}>
                    <NavLink to={communityPath(key)} end={key === 'home'}>{pages[key].nav}</NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Contact</h4>
              <ul className="footer-links">
                {config.contactEmail && (
                  <li><a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></li>
                )}
                {config.contactPhone && (
                  <li><a href={`tel:${config.contactPhone}`}>{config.contactPhone}</a></li>
                )}
                {config.whatsappNumber && (
                  <li>
                    <a href={whatsappLink(generalEnquiryMessage())} target="_blank" rel="noopener noreferrer">
                      Chat on WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4>Elsewhere</h4>
              <ul className="footer-links">
                <li>
                  <a href={`${config.siteUrl}/`} target="_blank" rel="noopener noreferrer">Website Offer</a>
                </li>
                <li>
                  <a
                    href={`${config.siteUrl}${config.roadmapRoute}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('roadmap_link_click', { placement: 'community_footer' })}
                  >
                    Development Roadmap
                  </a>
                </li>
                <li>
                  <a href="https://manojrashinkar.com" target="_blank" rel="noopener noreferrer">
                    manojrashinkar.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <p className="footer-copy">
            © {year} {venture.parent}. {venture.branch}. All rights reserved.
          </p>
        </div>
      </footer>

      <MobileStickyActions />
      <WebsiteAdvisor />
    </div>
  );
}
