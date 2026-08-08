import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsEvent, trackEvent } from '../analytics';
import { config } from '../config';
import {
  capabilities, commitments, pillars, steps, venture, work, workNote,
} from '../content/communityContent';
import { useDocumentMeta, type StructuredData } from '../hooks/useDocumentMeta';
import { useDiscussAction } from '../hooks/useDiscussAction';
import { attributionSummary } from '../utils/attribution';
import { whatsappLink } from '../utils/whatsapp';
import { scrollToSection } from '../utils/scroll';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import HeroAurora from '../components/HeroAurora';
import OfferHeader from '../components/OfferHeader';
import OfferFooter from '../components/OfferFooter';
import ScrollProgress from '../components/ScrollProgress';
import WhatsAppButton from '../components/WhatsAppButton';
import MobileStickyActions from '../components/MobileStickyActions';
import WebsiteAdvisor from '../components/website-advisor/WebsiteAdvisor';

const PAGE_TITLE = 'Web Services | Manoj Rashinkar Venture';
const PAGE_DESCRIPTION =
  'Web Services is the web development branch of Manoj Rashinkar Venture — business websites, ' +
  'web applications, redesigns, and domain and hosting setup for growing businesses.';
const PAGE_URL = `${config.siteUrl}${config.communityRoute}`;

const structuredData: StructuredData[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${venture.parent} — ${venture.branch}`,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    serviceType: 'Website design, web application development and deployment',
    areaServed: 'IN',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Website Offer', item: `${config.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Web Services', item: PAGE_URL },
    ],
  },
];

function whatsappIntro(): string {
  const lines = [
    'Hello, I found you through the Web Services page and would like to discuss a project.',
    '',
    'Business:',
    'What I need:',
  ];
  const utm = attributionSummary();
  if (utm) lines.push('', utm);
  return lines.join('\n');
}

export default function CommunityPage() {
  const discuss = useDiscussAction('community');

  useDocumentMeta({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    canonical: PAGE_URL,
    keywords:
      'web services, website development, business website developer, web application development, ' +
      'website redesign, domain and hosting setup, Manoj Rashinkar Venture',
    // Not finished yet. The page is reachable so it can be previewed and worked
    // on, but it should not turn up in search results until it is ready.
    // Remove this line, the robots.txt Disallow, and the sitemap omission
    // together when publishing.
    robots: 'noindex, nofollow',
    og: {
      'og:type': 'website',
      'og:title': `${venture.branch} — ${venture.parent}`,
      'og:description': PAGE_DESCRIPTION,
      'og:url': PAGE_URL,
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': `${venture.branch} — ${venture.parent}`,
      'twitter:description': PAGE_DESCRIPTION,
    },
    structuredData,
  });

  useEffect(() => { trackEvent('community_page_view'); }, []);

  return (
    <div className="offer-page community-page">
      <a className="skip-link" href="#about">Skip to content</a>
      <ScrollProgress />
      <OfferHeader />

      {/* ---------- Hero ---------- */}
      <section className="hero community-hero" id="top">
        <HeroAurora />
        <div className="container hero-inner community-hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span className="pulse-dot" aria-hidden="true" />
              {venture.parent}
            </p>
            <h1>
              <span className="text-gradient">{venture.branch}</span>
            </h1>
            <p className="hero-lead">{venture.tagline}</p>
            <p className="hero-sub">{venture.intro}</p>

            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={discuss}>
                Discuss a Project
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => { trackEvent('community_view_work'); scrollToSection('work'); }}
              >
                See Our Work
              </button>
              {config.whatsappNumber && (
                <a
                  className="btn btn-whatsapp"
                  href={whatsappLink(whatsappIntro())}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(AnalyticsEvent.whatsappClick, { placement: 'community_hero' })}
                >
                  <span className="hero-wa-label-full">WhatsApp Us</span>
                  <span className="hero-wa-label-short">WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          <div className="community-hero-panel">
            <p className="community-hero-panel-title">What this branch does</p>
            <ul className="community-hero-list">
              {capabilities.map((item) => (
                <li key={item.title}>
                  <Icon name={item.icon} size={17} />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <main>
        {/* ---------- About ---------- */}
        <section className="section" id="about">
          <div className="container">
            <div className="section-head">
              <h2>About Web Services</h2>
              <p>
                A small, deliberately unglamorous operation: one developer, honest scoping, and
                websites that do the job they were built for.
              </p>
            </div>
            <div className="pillar-grid">
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delay={index * 70} className="pillar-card">
                  <span className="pillar-icon" aria-hidden="true"><Icon name={pillar.icon} size={20} /></span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Capabilities ---------- */}
        <section className="section section-alt" id="services">
          <div className="container">
            <div className="section-head">
              <h2>What We Deliver</h2>
              <p>Four kinds of work. Most businesses need the first one and nothing else.</p>
            </div>
            <div className="capability-grid">
              {capabilities.map((item, index) => (
                <Reveal key={item.title} delay={(index % 2) * 80} className="capability-card">
                  <span className="capability-icon" aria-hidden="true"><Icon name={item.icon} size={22} /></span>
                  <h3>{item.title}</h3>
                  <p className="capability-summary">{item.summary}</p>
                  <ul className="dot-list">
                    {item.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Work ---------- */}
        <section className="section" id="work">
          <div className="container">
            <div className="section-head">
              <h2>Our Work</h2>
              <p>Live projects, shown only with the client’s permission.</p>
            </div>

            <div className="work-grid">
              {work.map((item, index) => (
                <Reveal key={item.name} delay={index * 80} className="work-card">
                  <span className="work-type">{item.type}</span>
                  <h3>{item.name}</h3>
                  <p className="work-sector">{item.sector}</p>
                  <ul className="dot-list">
                    {item.highlights.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                  <a
                    className="work-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(AnalyticsEvent.portfolioProjectClick, { project: item.name })}
                  >
                    Visit the live site
                    <Icon name="arrow-right" size={15} />
                  </a>
                </Reveal>
              ))}

              {/* Deliberately shown rather than padding the grid with invented
                  projects — the empty space is the honest state. */}
              <Reveal delay={120} className="work-card work-card-pending">
                <span className="work-type">More on the way</span>
                <h3>Awaiting client permission</h3>
                <p className="work-sector">{workNote}</p>
                {config.whatsappNumber && (
                  <a
                    className="work-link"
                    href={whatsappLink('Hello, could you show me work relevant to my kind of business?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(AnalyticsEvent.whatsappClick, { placement: 'community_work' })}
                  >
                    Ask about your sector
                    <Icon name="arrow-right" size={15} />
                  </a>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Process ---------- */}
        <section className="section section-alt" id="process">
          <div className="container">
            <div className="section-head">
              <h2>How a Project Runs</h2>
              <p>Six stages, with responsibilities agreed at each one so nothing stalls unnoticed.</p>
            </div>
            <ol className="community-steps">
              {steps.map((step, index) => (
                <Reveal as="li" key={step.n} delay={index * 55} className="community-step">
                  <span className="community-step-n" aria-hidden="true">{step.n}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <div className="section-cta">
              <Link
                className="btn btn-outline"
                to={config.roadmapRoute}
                onClick={() => trackEvent('roadmap_link_click', { placement: 'community' })}
              >
                Read the full development roadmap
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- Commitments ---------- */}
        <section className="section" id="commitments">
          <div className="container narrow">
            <div className="section-head">
              <h2>What We Will and Will Not Promise</h2>
              <p>The things worth saying plainly before anyone signs anything.</p>
            </div>
            <ul className="tick-list commitment-list">
              {commitments.map((line) => (
                <li key={line}>
                  <span className="tick" aria-hidden="true"><Icon name="check-circle" size={17} /></span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="section closing-cta">
          <div className="container">
            <div className="closing-cta-card">
              <h2>Tell Us What Your Business Needs</h2>
              <p>
                A short conversation is enough to work out what kind of website or application
                actually fits — and what it would involve.
              </p>
              <div className="closing-cta-actions">
                <button className="btn btn-primary btn-lg" type="button" onClick={discuss}>
                  Discuss a Project
                </button>
                <Link className="btn btn-outline btn-lg" to={config.offerRoute}>
                  View Current Website Offer
                </Link>
                {config.whatsappNumber && (
                  <a
                    className="btn btn-whatsapp btn-lg"
                    href={whatsappLink(whatsappIntro())}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(AnalyticsEvent.whatsappClick, { placement: 'community_cta' })}
                  >
                    Ask on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <OfferFooter />
      <WhatsAppButton />
      <MobileStickyActions />
      <WebsiteAdvisor />
    </div>
  );
}
