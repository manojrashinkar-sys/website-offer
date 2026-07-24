import { useEffect, useState } from 'react';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import Logo from './Logo';

const navLinks = [
  { id: 'offer', label: 'Offer' },
  { id: 'services', label: 'Services' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function OfferHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: highlight whichever section's heading is currently nearest
  // the top of the viewport, so the nav reflects where the visitor actually
  // is on the page.
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  const handleApply = (placement: string) => {
    setMenuOpen(false);
    trackEvent('promo_apply_click', { placement });
    scrollToSection('enquiry');
  };

  return (
    <header className={`offer-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <a
          className="brand"
          href={config.offerRoute}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Logo />
          {config.businessName && <span className="brand-name">{config.businessName}</span>}
        </a>

        <nav className="header-nav" aria-label="Page sections">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
              onClick={() => handleNav(link.id)}
            >
              {link.label}
            </button>
          ))}
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
          <button className="btn btn-primary btn-sm" onClick={() => handleApply('header')}>
            Apply Now
          </button>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="mobile-nav-backdrop"
          style={{ display: 'block' }}
          role="presentation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <nav
        id="mobile-navigation"
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
        aria-label="Page sections"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-head">
          <Logo size={26} />
          <button className="mobile-nav-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        {navLinks.map((link) => (
          <button
            key={link.id}
            className={`mobile-nav-link ${activeSection === link.id ? 'active' : ''}`}
            onClick={() => handleNav(link.id)}
          >
            {link.label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={() => handleApply('mobile_menu')}>
          Apply Now
        </button>
      </nav>
    </header>
  );
}
