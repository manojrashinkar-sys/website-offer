import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
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
    preview: 'yourbusiness.com',
    image: '/images/hero/website-design.jpg',
  },
  {
    eyebrow: 'Designed for Every Screen',
    lead: 'Turn Visitors Into ',
    highlight: 'Real Enquiries',
    tail: '',
    description: 'Give customers a fast, polished experience with clear services, strong calls to action, and one-tap WhatsApp contact.',
    theme: 'violet',
    preview: 'getmoreleads.com',
    image: '/images/hero/lead-generation.jpg',
  },
  {
    eyebrow: 'Launch With Confidence',
    lead: 'Get Your Business ',
    highlight: 'Online Faster',
    tail: '',
    description: 'From mobile-friendly design to basic SEO and deployment support, everything you need for a credible online presence.',
    theme: 'teal',
    preview: 'launchonline.com',
    image: '/images/hero/fast-launch.jpg',
  },
] as const;

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroSlides.length),
      3000,
    );
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const changeSlide = (index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  };

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    dragStartX.current = event.clientX;
    setIsPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;
    const width = heroRef.current?.clientWidth || 1;
    const distance = Math.max(-width * 0.32, Math.min(width * 0.32, event.clientX - dragStartX.current));
    dragOffsetRef.current = distance;
    setDragOffset(distance);
  };

  const finishDrag = () => {
    if (dragStartX.current === null) return;
    if (dragOffsetRef.current < -48) changeSlide(activeSlide + 1);
    if (dragOffsetRef.current > 48) changeSlide(activeSlide - 1);
    dragStartX.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsPaused(false);
  };

  return (
    <section
      ref={heroRef}
      className={`hero hero-theme-${heroSlides[activeSlide].theme}${dragStartX.current !== null ? ' is-dragging' : ''}`}
      style={{ '--hero-mobile-image': `url("${heroSlides[activeSlide].image}")` } as CSSProperties}
      id="top"
      aria-roledescription="carousel"
      aria-label="Website offer highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-slider-window">
            <div className="hero-slider-track" style={{ transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))` }}>
              {heroSlides.map((slide, index) => (
                <div className="hero-slide" key={slide.eyebrow} aria-hidden={index !== activeSlide}>
                  <button
                    className="hero-eyebrow"
                    type="button"
                    onClick={() => {
                      trackEvent('promo_offer_view', { placement: 'hero_badge' });
                      scrollToSection('offer');
                    }}
                    aria-label="View offer details"
                  >
                    <span className="pulse-dot" aria-hidden="true" />
                    <span className="hero-eyebrow-full">{slide.eyebrow}</span>
                    <span className="hero-eyebrow-mobile">View Offer <span aria-hidden="true">↓</span></span>
                  </button>
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
                <span className="hero-wa-label-full">Chat on WhatsApp</span>
                <span className="hero-wa-label-short">WhatsApp</span>
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
          <div
            className="hero-visual-track"
            style={{ transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))` }}
          >
            {heroSlides.map((slide, index) => (
              <div className={`hero-visual-slide preview-${slide.theme}`} key={slide.preview}>
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <img
                  className="hero-preview-image"
                  src={slide.image}
                  alt=""
                  width="720"
                  height="520"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
