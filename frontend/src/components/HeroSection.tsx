import { trackEvent } from '../analytics';
import { config } from '../config';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import { scrollToSection } from './OfferHeader';

export default function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            Limited Introductory Programme
          </p>
          <h1>
            Build a <span className="text-gradient">Professional Website</span> for Your Business
          </h1>
          <p className="hero-sub">
            A clean, mobile-friendly website built around your business — designed to help
            customers find you, trust you, and get in touch.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-glow"
              onClick={() => {
                trackEvent('promo_apply_click', { placement: 'hero' });
                scrollToSection('enquiry');
              }}
            >
              Apply Now
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                trackEvent('promo_services_view', { placement: 'hero' });
                scrollToSection('services');
              }}
            >
              View Services
            </button>
            {config.whatsappNumber && (
              <a
                className="btn btn-whatsapp"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'hero' })}
              >
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          {/* Abstract browser-frame mockup + drifting gradient blobs — pure CSS, no copyrighted images. */}
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="browser-frame">
            <div className="browser-bar">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <span className="browser-url">yourbusiness.com</span>
            </div>
            <div className="browser-body">
              <div className="mock-nav" />
              <div className="mock-hero">
                <div className="mock-line w-70" />
                <div className="mock-line w-50" />
                <div className="mock-btn-row"><span className="mock-btn" /><span className="mock-btn ghost" /></div>
              </div>
              <div className="mock-cards">
                <div className="mock-card" /><div className="mock-card" /><div className="mock-card" />
              </div>
            </div>
          </div>
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-body">
              <div className="mock-line w-70" />
              <div className="mock-line w-50" />
              <div className="mock-card tall" />
              <div className="mock-btn full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
