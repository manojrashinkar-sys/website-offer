import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import { capabilities, pillars, venture, work } from '../../content/communityContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import type { StructuredData } from '../../hooks/useDocumentMeta';
import { communityOrigin, communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import Icon from '../../components/Icon';
import Reveal from '../../components/Reveal';

const structuredData: StructuredData[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${venture.parent} — ${venture.branch}`,
    description: venture.intro,
    url: `${communityOrigin}/`,
    serviceType: 'Website design, web application development and deployment',
    areaServed: 'IN',
  },
];

export default function HomePage() {
  const discuss = useDiscussAction('community_home');
  useCommunityMeta('home', structuredData);
  useEffect(() => { trackEvent('community_page_view', { page: 'home' }); }, []);

  return (
    <>
      <PageHero
        page="home"
        actions={
          <>
            <button className="btn btn-primary btn-lg" onClick={discuss}>Discuss a Project</button>
            <Link className="btn btn-outline btn-lg" to={communityPath('services')}>What We Build</Link>
            <Link className="btn btn-outline btn-lg" to={communityPath('work')}>Our Work</Link>
          </>
        }
        aside={
          <div className="community-hero-panel">
            <p className="community-hero-panel-title">What we build</p>
            <ul className="community-hero-list">
              {capabilities.map((c) => (
                <li key={c.title}>
                  <span className="community-hero-icon"><Icon name={c.icon} size={18} /></span>
                  <span className="community-hero-text">
                    <strong>{c.title}</strong>
                    <small>{c.summary}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* ---------- How we work ---------- */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Four things that do not change</h2>
              <p>
                Whatever the project, these hold. They are the arrangement, not a sales promise.
              </p>
            </div>
          </Reveal>

          <div className="pillar-grid">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 70}>
                <article className="pillar-card">
                  <span className="pillar-icon"><Icon name={pillar.icon} size={24} /></span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="community-section-more">
              <Link className="community-more-link" to={communityPath('about')}>
                More about how this branch is run
                <Icon name="arrow-right" size={16} />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- What we build ---------- */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>What we build</h2>
              <p>
                Most businesses need the first of these. We will tell you plainly if you do not need
                the rest.
              </p>
            </div>
          </Reveal>

          <div className="capability-grid">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.title} delay={index * 70}>
                <article className="capability-card">
                  <span className="capability-icon"><Icon name={capability.icon} size={26} /></span>
                  <h3>{capability.title}</h3>
                  <p className="capability-summary">{capability.summary}</p>
                  <ul className="tick-list">
                    {capability.points.slice(0, 3).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="community-section-more">
              <Link className="community-more-link" to={communityPath('services')}>
                See what each one involves
                <Icon name="arrow-right" size={16} />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Work ---------- */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Work we are permitted to show</h2>
              <p>A project appears here only once that client has agreed to it.</p>
            </div>
          </Reveal>

          <div className="work-grid">
            {work.map((item, index) => (
              <Reveal key={item.name} delay={index * 70}>
                <article className="work-card">
                  <span className="work-type">{item.type}</span>
                  <h3>{item.name}</h3>
                  <p className="work-sector">{item.sector}</p>
                  <a
                    className="work-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('community_work_click', { project: item.name })}
                  >
                    Visit the site
                    <Icon name="arrow-right" size={16} />
                  </a>
                </article>
              </Reveal>
            ))}

            <Reveal delay={work.length * 70}>
              <article className="work-card work-card-pending">
                <span className="work-type">Awaiting client permission</span>
                <h3>More projects</h3>
                <p className="work-sector">
                  We do not publish a client’s work until that client has agreed. This page fills up
                  by consent, not by need.
                </p>
                <Link className="work-link" to={communityPath('work')}>
                  Why this page is short
                  <Icon name="arrow-right" size={16} />
                </Link>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Closing ---------- */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="community-cta">
              <h2>Tell us what the business needs</h2>
              <p>
                Describe what you do and what is not working. You will get a straight answer about
                whether we can help — including if the answer is no.
              </p>
              <div className="community-cta-actions">
                <button className="btn btn-primary btn-lg" onClick={discuss}>Discuss a Project</button>
                <Link className="btn btn-outline btn-lg" to={communityPath('contact')}>Contact</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
