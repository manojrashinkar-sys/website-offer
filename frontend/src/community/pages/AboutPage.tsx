import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import {
  aboutStory, commitments, founderNote, values, venture, whoWeServe,
} from '../../content/communityContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import { communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import Icon from '../../components/Icon';
import Reveal from '../../components/Reveal';

export default function AboutPage() {
  const discuss = useDiscussAction('community_about');
  useCommunityMeta('about');
  useEffect(() => { trackEvent('community_page_view', { page: 'about' }); }, []);

  return (
    <>
      <PageHero page="about" eyebrow={venture.parent} />

      {/* ---------- Story ---------- */}
      <section className="section">
        <div className="container community-prose-wrap">
          <Reveal>
            <div className="section-head">
              <h2>Why this branch exists</h2>
            </div>
          </Reveal>
          <div className="community-prose">
            {aboutStory.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 70}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>What we hold to</h2>
              <p>Four principles that decide how the work is done, and what we will not do.</p>
            </div>
          </Reveal>

          <div className="pillar-grid">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 70}>
                <article className="pillar-card">
                  <span className="pillar-icon"><Icon name={value.icon} size={24} /></span>
                  <h3>{value.title}</h3>
                  <p>{value.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Who we serve ---------- */}
      <section className="section">
        <div className="container community-split">
          <Reveal>
            <div>
              <div className="section-head section-head-left">
                <h2>Who we usually work with</h2>
                <p>
                  Not an exhaustive list, and not a filter. If your business is not on it, ask
                  anyway — the worst outcome is an honest no.
                </p>
              </div>
              <ul className="tick-list">
                {whoWeServe.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <aside className="community-aside">
              <h3>{founderNote.heading}</h3>
              <p>{founderNote.body}</p>
              <a
                className="work-link"
                href={founderNote.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('community_founder_link_click')}
              >
                {founderNote.linkLabel}
                <Icon name="arrow-right" size={16} />
              </a>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ---------- Commitments ---------- */}
      <section className="section section-alt">
        <div className="container community-prose-wrap">
          <Reveal>
            <div className="section-head">
              <h2>What we will and will not promise</h2>
              <p>
                The things worth saying out loud, before money or expectations are involved.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ul className="dot-list commitment-list">
              {commitments.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------- Closing ---------- */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="community-cta">
              <h2>Still deciding whether we are a fit?</h2>
              <p>
                Look at how a project actually runs, or just describe your situation and get an
                honest read on it.
              </p>
              <div className="community-cta-actions">
                <Link className="btn btn-outline btn-lg" to={communityPath('process')}>How a Project Runs</Link>
                <button className="btn btn-primary btn-lg" onClick={discuss}>Discuss a Project</button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
