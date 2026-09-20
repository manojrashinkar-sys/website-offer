import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import { workNote } from '../../content/communityContent';
import { communityPath } from '../routing';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import WorkShowcase from '../WorkShowcase';
import CommunityCta from '../CommunityCta';
import Reveal from '../../components/Reveal';

export default function WorkPage() {
  useCommunityMeta('work');
  useEffect(() => { trackEvent('community_page_view', { page: 'work' }); }, []);

  return (
    <>
      <PageHero page="work" eyebrow="Our work" />

      <section className="section">
        <div className="container">
          <WorkShowcase />

          <Reveal>
            <article className="work-card work-card-pending work-card-note">
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

          <Reveal>
            <p className="section-note community-note">{workNote}</p>
          </Reveal>
        </div>
      </section>

      <CommunityCta
        heading="Want to see something closer to your sector?"
        body="Ask. We will tell you honestly what we can show, what we cannot, and why — rather than sending a portfolio of work that belongs to somebody else."
        page="work"
      >
        <Link className="btn btn-outline btn-lg" to={communityPath('services')}>What We Build</Link>
      </CommunityCta>
    </>
  );
}
