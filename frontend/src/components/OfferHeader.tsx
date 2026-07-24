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
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
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
  }, []);

  const handleApply = () => {
    trackEvent('promo_apply_click', { placement: 'header' });
    scrollToSection('enquiry');
  };

  return (
    <header className={`offer-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <a
          className="brand"
          href={config.offerRoute}
          onClick={(event) => {
            event.preventDefault();
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
              onClick={() => scrollToSection(link.id)}
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
          <button className="btn btn-primary btn-sm" onClick={handleApply}>
            Apply Now
          </button>
        </div>
      </div>
    </header>
  );
}
