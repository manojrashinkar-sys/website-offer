import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import { capabilities, capabilityDetail, servicesNote } from '../../content/communityContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import type { StructuredData } from '../../hooks/useDocumentMeta';
import { communityCanonical, communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import Icon from '../../components/Icon';
import Reveal from '../../components/Reveal';

const structuredData: StructuredData[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Web development services',
    url: communityCanonical('services'),
    itemListElement: capabilities.map((capability, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: capability.title,
      description: capability.summary,
    })),
  },
];

export default function ServicesPage() {
  const discuss = useDiscussAction('community_services');
  useCommunityMeta('services', structuredData);
  useEffect(() => { trackEvent('community_page_view', { page: 'services' }); }, []);

  return (
    <>
      <PageHero page="services" eyebrow="Services" />

      <section className="section">
        <div className="container">
          <div className="service-stack">
            {capabilities.map((capability, index) => {
              const detail = capabilityDetail[capability.title];
              return (
                <Reveal key={capability.title} delay={index * 60}>
                  <article className="service-block" id={capability.title.toLowerCase().replace(/\s+/g, '-')}>
                    <div className="service-block-head">
                      <span className="capability-icon"><Icon name={capability.icon} size={28} /></span>
                      <div>
                        <h2>{capability.title}</h2>
                        <p className="capability-summary">{capability.summary}</p>
                      </div>
                    </div>

                    <div className="service-block-body">
                      <div>
                        <h3 className="service-label">What it includes</h3>
                        <ul className="tick-list">
                          {capability.points.map((point) => <li key={point}>{point}</li>)}
                        </ul>
                      </div>

                      {detail && (
                        <div className="service-notes">
                          <div>
                            <h3 className="service-label">Who it suits</h3>
                            <p>{detail.suits}</p>
                          </div>
                          <div>
                            <h3 className="service-label">Worth knowing</h3>
                            <p>{detail.note}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <p className="section-note community-note">{servicesNote}</p>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="community-cta">
              <h2>Not sure which one you need?</h2>
              <p>
                That is the normal starting point. Describe the business and what is not working,
                and the answer usually settles itself in one conversation.
              </p>
              <div className="community-cta-actions">
                <button className="btn btn-primary btn-lg" onClick={discuss}>Discuss a Project</button>
                <Link className="btn btn-outline btn-lg" to={communityPath('process')}>See the Process</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
