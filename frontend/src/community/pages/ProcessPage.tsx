import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { trackEvent } from '../../analytics';
import { processNote, stepDetail, steps } from '../../content/communityContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import type { StructuredData } from '../../hooks/useDocumentMeta';
import { communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import Icon from '../../components/Icon';
import Reveal from '../../components/Reveal';

const structuredData: StructuredData[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How a web development project runs',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  },
];

export default function ProcessPage() {
  const discuss = useDiscussAction('community_process');
  useCommunityMeta('process', structuredData);
  useEffect(() => { trackEvent('community_page_view', { page: 'process' }); }, []);

  return (
    <>
      <PageHero page="process" eyebrow="Process" />

      <section className="section">
        <div className="container">
          <ol className="stage-list">
            {steps.map((step, index) => {
              const detail = stepDetail[step.n];
              return (
                <Reveal key={step.n} delay={index * 60} as="li">
                  <article className="stage">
                    <div className="stage-marker" aria-hidden="true">
                      <span className="stage-n">{step.n}</span>
                    </div>
                    <div className="stage-body">
                      <h2>{step.title}</h2>
                      <p className="stage-lead">{step.body}</p>
                      {detail && (
                        <div className="stage-detail">
                          <div>
                            <h3 className="service-label">What you provide</h3>
                            <p>{detail.youProvide}</p>
                          </div>
                          <div>
                            <h3 className="service-label">What you get</h3>
                            <p>{detail.youGet}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ol>

          <Reveal>
            <p className="section-note community-note">{processNote}</p>
          </Reveal>

          <Reveal>
            <p className="community-section-more">
              <a
                className="community-more-link"
                href={`${config.siteUrl}${config.roadmapRoute}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('roadmap_link_click', { placement: 'community_process' })}
              >
                Every stage explained in full detail
                <Icon name="arrow-right" size={16} />
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="community-cta">
              <h2>Start at stage one</h2>
              <p>
                Discovery costs nothing and commits you to nothing. It exists so both sides can tell
                whether the project is worth doing.
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
