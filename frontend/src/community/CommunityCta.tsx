import type { ReactNode } from 'react';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { useDiscussAction } from '../hooks/useDiscussAction';
import { attributionSummary } from '../utils/attribution';
import { whatsappLink } from '../utils/whatsapp';
import Reveal from '../components/Reveal';
import ParticleRibbon from './ParticleRibbon';

/** Opening message for someone who came from a particular page. */
function intro(page: string): string {
  const lines = [
    'Hello, I found you through the Web Services site and would like to discuss a project.',
    '',
    'Business:',
    'What I need:',
  ];
  const utm = attributionSummary();
  if (utm) lines.push('', utm);
  lines.push('', `(from the ${page} page)`);
  return lines.join('\n');
}

interface Props {
  heading: string;
  body: string;
  /** Analytics placement, and the page named in the WhatsApp message. */
  page: string;
  /** An extra link, where one page wants to point at another. */
  children?: ReactNode;
}

/**
 * The band that ends every page.
 *
 * Two things at once. It gives each page a real way to act rather than
 * another button that navigates somewhere else — WhatsApp is right there,
 * one tap, no page load, which is how most of this audience makes contact.
 *
 * And it breaks the rhythm. Six pages of white cards on a white ground read
 * as one long undifferentiated scroll; a dark full-width band at the end of
 * each gives the eye a floor and makes the page feel finished rather than
 * simply stopped.
 */
export default function CommunityCta({ heading, body, page, children }: Props) {
  const discuss = useDiscussAction(`community_${page}`);

  return (
    <section className="community-cta-band">
      {/* A quieter ribbon; each instance pauses independently off screen. */}
      <ParticleRibbon intensity="band" />
      <div className="container">
        <Reveal>
          <div className="community-cta">
            <h2>{heading}</h2>
            <p>{body}</p>
            <div className="community-cta-actions">
              <button className="btn btn-primary btn-lg" onClick={discuss}>
                Discuss a Project
              </button>
              {config.whatsappNumber && (
                <a
                  className="btn btn-whatsapp btn-lg"
                  href={whatsappLink(intro(page))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('promo_whatsapp_click', { placement: `community_${page}_cta` })}
                >
                  WhatsApp
                </a>
              )}
              {children}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
