import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import {
  capabilities, pillars, serviceAreas, venture, work,
} from '../../content/communityContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import type { StructuredData } from '../../hooks/useDocumentMeta';
import { communityOrigin, communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import HeroPipeline from '../HeroPipeline';
import CapabilityMarquee from '../CapabilityMarquee';
import SafeImage from '../SafeImage';
import CommunityCta from '../CommunityCta';
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
    // Named places rather than a bare country code. These are the towns the
    // delivered projects are in, which is what local search actually matches.
    areaServed: [
      ...serviceAreas.places.map((name) => ({ '@type': 'City', name })),
      { '@type': 'AdministrativeArea', name: serviceAreas.region },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Published client projects',
    itemListElement: work.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebSite',
        name: item.name,
        url: item.url,
        description: item.sector,
      },
    })),
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
            <Link className="btn btn-outline btn-lg" to={communityPath('work')}>See Our Work</Link>
          </>
        }
        aside={<HeroPipeline />}
      />

      <CapabilityMarquee />

      {/* ---------- Work, first ----------
          Evidence before claims. Someone landing here wants to know whether
          this person can build the thing, and three real sites answer that
          faster than any number of statements about how we work. */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Recent work</h2>
              <p>Three businesses, three very different problems. Browse their websites and previews.</p>
            </div>
          </Reveal>

          <div className="work-grid">
            {work.map((item, index) => (
              <Reveal key={item.name} delay={index * 70}>
                <article className="work-card">
                  {item.shots?.[0] && (
                    <SafeImage
                      figureClassName="work-shot"
                      src={item.shots[0].src}
                      alt={item.shots[0].alt}
                      width={1000}
                      height={505}
                    />
                  )}
                  <div className="work-card-tags">
                    <span className="work-type">{item.type}</span>
                    {item.status === 'preview' && <span className="work-type work-type-preview">In review</span>}
                  </div>
                  <h3>{item.name}</h3>
                  <p className="work-sector">{item.sector}</p>
                  <a
                    className="work-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('community_work_click', { project: item.name })}
                  >
                    {item.status === 'preview' ? 'View the preview' : 'Visit the site'}
                    <Icon name="arrow-right" size={16} />
                  </a>
                </article>
              </Reveal>
            ))}

          </div>
          <p className="community-section-more">
            <Link className="community-more-link" to={communityPath('work')}>Explore all client projects <Icon name="arrow-right" size={16} /></Link>
          </p>
        </div>
      </section>

      {/* ---------- How we work ---------- */}
      <section className="section section-alt">
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
      <section className="section">
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



      {/* ---------- Closing ---------- */}
      <CommunityCta
        heading="Tell me what the business needs"
        body="Describe what you do and what is not working. You will get a straight answer about whether I can help — including if the answer is no."
        page="home"
      ></CommunityCta>
    </>
  );
}
