import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { trackEvent } from '../../analytics';
import { processNote, stepDetail, steps } from '../../content/communityContent';
import type { StructuredData } from '../../hooks/useDocumentMeta';
import { communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import ProcessStepper from '../ProcessStepper';
import CommunityCta from '../CommunityCta';
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
  useCommunityMeta('process', structuredData);
  useEffect(() => { trackEvent('community_page_view', { page: 'process' }); }, []);

  return (
    <>
      <PageHero page="process" eyebrow="Process" />

      <section className="section">
        <div className="container">
          <ProcessStepper />

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

      <CommunityCta
        heading="Start at stage one"
        body="Discovery costs nothing and commits you to nothing. It exists so both sides can tell whether the project is worth doing."
        page="process"
      >
        <Link className="btn btn-outline btn-lg" to={communityPath('contact')}>Contact</Link>
      </CommunityCta>
    </>
  );
}
