import { trackEvent } from '../../analytics';
import { config } from '../../config';
import { heroFlow } from '../../content/roadmapContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import { generalEnquiryMessage, whatsappLink } from '../../utils/whatsapp';
import { scrollToSection } from '../OfferHeader';
import HeroAurora from '../HeroAurora';
import FlowChain from './FlowChain';

export default function RoadmapHero() {
  const discuss = useDiscussAction('roadmap_hero');

  return (
    <section className="hero roadmap-hero" id="top">
      <HeroAurora />
      <div className="container hero-inner roadmap-hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            Complete Website Delivery Process
          </p>
          <h1>
            Your Website <span className="text-gradient">Development Roadmap</span>
          </h1>
          <p className="hero-lead">From Business Idea to Website Launch</p>
          <p className="hero-sub">
            Understand how your website is planned, designed, developed, connected to your
            domain, securely deployed, tested, launched, and maintained.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-glow" type="button" onClick={discuss}>
              Discuss Your Website
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                trackEvent('roadmap_explore_click', { placement: 'hero' });
                scrollToSection('process');
              }}
            >
              Explore the Roadmap
            </button>
            {config.whatsappNumber && (
              <a
                className="btn btn-whatsapp"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'roadmap_hero' })}
              >
                <span className="hero-wa-label-full">WhatsApp Us</span>
                <span className="hero-wa-label-short">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        <div className="roadmap-hero-flow">
          <p className="roadmap-hero-flow-title">The journey at a glance</p>
          <FlowChain
            nodes={heroFlow}
            variant="stack"
            numbered
            tone="dark"
            label="Website delivery stages, in order"
          />
        </div>
      </div>
    </section>
  );
}
