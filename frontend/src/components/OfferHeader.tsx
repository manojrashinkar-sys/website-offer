import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { useDiscussAction } from '../hooks/useDiscussAction';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import { scrollToSection } from '../utils/scroll';
import Logo from './Logo';

const offerNavLinks = [
  { id: 'offer', label: 'Offer' },
  { id: 'services', label: 'Services' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

// On desktop the roadmap page carries its own sticky section navigation, so the
// header stays minimal there. In the mobile drawer there is room for the jump
// links, so they are listed.
const roadmapDrawerLinks = [
  { id: 'overview', label: 'Overview' },
  { id: 'website-options', label: 'Website Options' },
  { id: 'process', label: 'Development Process' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'technologies', label: 'Technologies' },
  { id: 'hosting', label: 'Hosting' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'roadmap-faq', label: 'FAQs' },
];

// Re-exported for the components that have always imported it from here.
export { scrollToSection };

export default function OfferHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const onRoadmap = location.pathname === config.roadmapRoute;
  const desktopNavLinks = onRoadmap ? [] : offerNavLinks;
  const drawerLinks = onRoadmap ? roadmapDrawerLinks : offerNavLinks;
  const discuss = useDiscussAction('header');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = desktopNavLinks
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => !!element);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    sections.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [desktopNavLinks]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Never leave the drawer open across a route change — returning to a page
  // with a half-open menu is exactly the kind of oddity to avoid here.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // While the drawer is open: lock the page behind it, close on Escape, and
  // keep Tab inside the drawer so focus cannot wander to hidden content.
  useEffect(() => {
    if (!menuOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
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
      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
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

  const goToSection = (id: string) => {
    setMenuOpen(false);
    // Let the drawer close and the scroll lock lift before scrolling, otherwise
    // the browser measures the page while it is still frozen.
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <>
      <header className={`offer-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <a
            className="brand"
            href={config.offerRoute}
            aria-label={`${config.brandName} — home`}
            onClick={(event) => {
              event.preventDefault();
              if (onRoadmap) navigate(config.offerRoute);
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Logo />
          </a>

          <nav className="header-nav" aria-label="Page sections">
            {desktopNavLinks.map((link) => (
              <button
                key={link.id}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </button>
            ))}

            {onRoadmap ? (
              <Link
                className="nav-link nav-link-page"
                to={config.offerRoute}
                onClick={() => trackEvent('roadmap_offer_link_click', { placement: 'header' })}
              >
                Website Offer
              </Link>
            ) : (
              <Link
                className="nav-link nav-link-page"
                to={config.roadmapRoute}
                onClick={() => trackEvent('roadmap_link_click', { placement: 'header' })}
              >
                Development Roadmap
              </Link>
            )}
          </nav>

          <div className="header-actions">
            {config.whatsappNumber && (
              <a
                className="header-contact-btn"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'header' })}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.02 2 11c0 2.44 1.08 4.65 2.84 6.27L4 22l4.98-1.6c.95.26 1.96.4 3.02.4 5.52 0 10-4.02 10-9S17.52 2 12 2zm-4 8h8v2H8v-2zm0-3h8v2H8V7zm0 6h5v2H8v-2z" />
                </svg>
              </a>
            )}

            <button className="btn btn-primary btn-sm header-cta" onClick={discuss}>
              {onRoadmap ? 'Discuss Website' : 'Apply Now'}
            </button>

            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
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

      {menuOpen && (
        <div className="mobile-nav-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      <div
        id="mobile-nav"
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-head">
          <Logo />
          <button type="button" className="mobile-nav-close" onClick={closeMenu} aria-label="Close menu">
            ×
          </button>
        </div>

        <p className="mobile-nav-label">On this page</p>
        {drawerLinks.map((link) => (
          <button
            key={link.id}
            className="mobile-nav-link"
            onClick={() => goToSection(link.id)}
          >
            {link.label}
          </button>
        ))}

        <p className="mobile-nav-label">Explore</p>
        <Link
          className={`mobile-nav-link ${onRoadmap ? '' : 'active'}`}
          to={config.offerRoute}
          onClick={() => setMenuOpen(false)}
        >
          Website Offer
        </Link>
        <Link
          className={`mobile-nav-link ${onRoadmap ? 'active' : ''}`}
          to={config.roadmapRoute}
          onClick={() => {
            setMenuOpen(false);
            trackEvent('roadmap_link_click', { placement: 'mobile_nav' });
          }}
        >
          Development Roadmap
        </Link>

        {config.whatsappNumber && (
          <a
            className="btn btn-whatsapp mobile-nav-wa"
            href={whatsappLink(generalEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setMenuOpen(false);
              trackEvent('promo_whatsapp_click', { placement: 'mobile_nav' });
            }}
          >
            Chat on WhatsApp
          </a>
        )}

        <button
          className="btn btn-primary"
          onClick={() => {
            setMenuOpen(false);
            discuss();
          }}
        >
          {onRoadmap ? 'Discuss Your Website' : 'Apply Now'}
        </button>
      </div>
    </>
  );
}
