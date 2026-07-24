import { useEffect, useState } from 'react';
import { trackEvent } from '../analytics';
import { config } from '../config';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import { scrollToSection } from './OfferHeader';

const heroSlides = [
  {
    eyebrow: 'Limited Introductory Programme',
    lead: 'Build a ',
    highlight: 'Professional Website',
    tail: ' for Your Business',
    description: 'A clean, mobile-friendly website built around your business — designed to help customers find you, trust you, and get in touch.',
    theme: 'blue',
  },
  {
    eyebrow: 'Designed for Every Screen',
    lead: 'Turn Visitors Into ',
    highlight: 'Real Enquiries',
    tail: '',
    description: 'Give customers a fast, polished experience with clear services, strong calls to action, and one-tap WhatsApp contact.',
    theme: 'violet',
  },
  {
    eyebrow: 'Launch With Confidence',
    lead: 'Get Your Business ',
    highlight: 'Online Faster',
    tail: '',
    description: 'From mobile-friendly design to basic SEO and deployment support, everything you need for a credible online presence.',
    theme: 'teal',
  },
] as const;

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroSlides.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const changeSlide = (index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  };

  return (
    <section
      className={`hero hero-theme-${heroSlides[activeSlide].theme}`}
      id="top"
      aria-roledescription="carousel"
      aria-label="Website offer highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
    >
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-slider-window">
            <div className="hero-slider-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
              {heroSlides.map((slide, index) => (
                <div className="hero-slide" key={slide.eyebrow} aria-hidden={index !== activeSlide}>
                  <p className="hero-eyebrow">
                    <span className="pulse-dot" aria-hidden="true" />
                    {slide.eyebrow}
                  </p>
                  <h1>
                    {slide.lead}<span className="text-gradient">{slide.highlight}</span>{slide.tail}
                  </h1>
                  <p className="hero-sub">{slide.description}</p>
                </div>
              ))}
            </div>
          </div>

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

          <div className="hero-controls">
            <button className="hero-arrow" type="button" onClick={() => changeSlide(activeSlide - 1)} aria-label="Previous hero slide">‹</button>
            <div className="hero-dots" aria-label="Choose a hero slide">
              {heroSlides.map((slide, index) => (
                <button
                  className={`hero-dot${index === activeSlide ? ' active' : ''}`}
                  type="button"
                  key={slide.eyebrow}
                  onClick={() => changeSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === activeSlide ? 'true' : undefined}
                />
              ))}
            </div>
            <button className="hero-arrow" type="button" onClick={() => changeSlide(activeSlide + 1)} aria-label="Next hero slide">›</button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
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
