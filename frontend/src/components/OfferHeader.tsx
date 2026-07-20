import { useEffect, useState } from 'react';
import { config } from '../config';
import { trackEvent } from '../analytics';
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
    return () => {
      document.body.style.overflow = '';
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
          <button className="btn btn-primary btn-sm" onClick={() => handleApply('header')}>
            Apply Now
          </button>
          <button
            className="menu-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            ☰
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
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
        aria-label="Page sections"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-head">
          <Logo size={26} />
          <button className="mobile-nav-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            ✕
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
