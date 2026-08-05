import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import { config } from '../../config';
import { complimentaryIntro, complimentaryTerms } from '../../content/roadmapContent';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import Reveal from '../Reveal';

// Deliberately a summary, not a restatement: the full programme terms live on
// the offer page, and this section links there rather than duplicating (and
// risking contradicting) them.
export default function ComplimentaryOffer() {
  const discuss = useDiscussAction('roadmap_complimentary');

  return (
    <section className="section offer-section" id="complimentary">
      <div className="container">
        <Reveal className="status-card offer-card">
          <span className="status-badge open">
            <span className="status-dot" aria-hidden="true" />
            Introductory Programme
          </span>
          <h2>Complimentary Development for Selected Initial Projects</h2>
          <p>{complimentaryIntro}</p>

          <ul className="offer-points">
            {complimentaryTerms.map((term) => (
              <li key={term}>
                <span className="check" aria-hidden="true">✓</span>
                {term}
              </li>
            ))}
          </ul>

          <div className="offer-card-cta">
            <div>
              <strong>Full programme terms are on the offer page</strong>
              <span>Eligibility, review process and what is included are explained there.</span>
            </div>
            <div className="offer-card-cta-actions">
              <Link
                className="btn btn-outline"
                to={config.offerRoute}
                onClick={() => trackEvent('roadmap_offer_link_click', { placement: 'complimentary' })}
              >
                View Current Website Offer
              </Link>
              <button className="btn btn-primary" type="button" onClick={discuss}>
                Discuss Your Website
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
