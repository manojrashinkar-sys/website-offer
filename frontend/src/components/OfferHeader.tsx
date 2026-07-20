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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  const handleApply = () => {
    setMenuOpen(false);
    trackEvent('promo_apply_click', { placement: 'header' });
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
            <button key={link.id} className="nav-link" onClick={() => handleNav(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="btn btn-primary btn-sm" onClick={handleApply}>
            Apply Now
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Page sections">
          {navLinks.map((link) => (
            <button key={link.id} className="mobile-nav-link" onClick={() => handleNav(link.id)}>
              {link.label}
            </button>
          ))}
          <button className="btn btn-primary" onClick={handleApply}>
            Apply Now
          </button>
        </nav>
      )}
    </header>
  );
}
