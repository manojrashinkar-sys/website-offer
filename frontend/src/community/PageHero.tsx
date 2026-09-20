import { Fragment, type ReactNode } from 'react';
import { pages, type PageKey } from '../content/communityContent';
import HeroAurora from '../components/HeroAurora';
import ParticleRibbon from './ParticleRibbon';

interface Props {
  page: PageKey;
  /** Buttons or links under the lead. */
  actions?: ReactNode;
  /** Panel or illustration beside the copy on wide screens. */
  aside?: ReactNode;
  /** Small label above the heading, e.g. the parent brand. */
  eyebrow?: string;
}

/**
 * Shared page opener. Every page gets the same shape so moving between them
 * feels like one site rather than six that happen to share a footer.
 *
 * Pages with an `aside` get the two-column treatment; the rest centre their
 * copy, which reads better than a half-empty grid.
 */
export default function PageHero({ page, actions, aside, eyebrow }: Props) {
  const { heading, lead } = pages[page];

  return (
    <section className={`hero community-hero ${aside ? '' : 'community-hero-solo'}`}>
      <HeroAurora />
      <ParticleRibbon />
      {/* Two slow-drifting lights behind the copy. Decorative, so they are
          hidden from assistive technology and stopped under reduced motion. */}
      <span className="hero-glow hero-glow-a" aria-hidden="true" />
      <span className="hero-glow hero-glow-b" aria-hidden="true" />

      <div className="container community-hero-inner">
        <div className="hero-copy">
          {eyebrow && <p className="community-eyebrow">{eyebrow}</p>}
          {/* Spaces belong between inline blocks; trailing whitespace inside
              an inline block collapses and joins the visible words. */}
          <h1 className="hero-headline">
            {heading.split(' ').map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <span
                  className="hero-word"
                  style={{ animationDelay: `${0.06 + index * 0.055}s` }}
                >
                  {word}
                </span>
                {index < heading.split(' ').length - 1 ? ' ' : ''}
              </Fragment>
            ))}
          </h1>
          <p className="hero-sub">{lead}</p>
          {actions && <div className="hero-actions">{actions}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}
