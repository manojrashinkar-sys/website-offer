import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import { work, workNote } from '../../content/communityContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import { communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import Icon from '../../components/Icon';
import Reveal from '../../components/Reveal';

export default function WorkPage() {
  const discuss = useDiscussAction('community_work');
  useCommunityMeta('work');
  useEffect(() => { trackEvent('community_page_view', { page: 'work' }); }, []);

  return (
    <>
      <PageHero page="work" eyebrow="Our work" />

      <section className="section">
        <div className="container">
          <div className="work-grid work-grid-detailed">
            {work.map((item, index) => (
              <Reveal key={item.name} delay={index * 70}>
                <article className="work-card">
                  <span className="work-type">{item.type}</span>
                  <h2>{item.name}</h2>
                  <p className="work-sector">{item.sector}</p>
                  <ul className="tick-list">
                    {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
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
                <h2>More projects</h2>
                <p className="work-sector">
                  Other projects have been delivered. They are not shown here because those clients
                  have not agreed to have their work published, and we do not treat silence as
                  consent.
                </p>
                <p className="work-sector">
                  The same applies to yours. Nothing of yours appears anywhere without you saying so.
                </p>
              </article>
            </Reveal>
          </div>

          <Reveal>
            <p className="section-note community-note">{workNote}</p>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="community-cta">
              <h2>Want to see something closer to your sector?</h2>
              <p>
                Ask. We will tell you honestly what we can show, what we cannot, and why — rather
                than sending a portfolio of work that belongs to somebody else.
              </p>
              <div className="community-cta-actions">
                <button className="btn btn-primary btn-lg" onClick={discuss}>Ask About Your Sector</button>
                <Link className="btn btn-outline btn-lg" to={communityPath('services')}>What We Build</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
