import { offerPoints } from '../content/pageContent';
import { trackEvent } from '../analytics';
import Reveal from './Reveal';
import { scrollToSection } from './OfferHeader';

export default function OfferSection() {
  return (
    <section className="section offer-section" id="offer">
      <div className="container">
        <Reveal className="status-card offer-card">
          <span className="status-badge open">
            <span className="status-dot" aria-hidden="true" />
            Introductory Programme
          </span>
          <h2>About the Offer</h2>
          <p>
            For a limited introductory period, we are supporting selected businesses in
            establishing a professional online presence. Here is exactly how it works:
          </p>
          <ul className="offer-points">
            {offerPoints.map((point) => (
              <li key={point}>
                <span className="check" aria-hidden="true">✓</span>
                {point}
              </li>
            ))}
          </ul>
          <div className="offer-card-cta">
            <div>
              <strong>Ready to check your eligibility?</strong>
              <span>Share your business details for a personal review.</span>
            </div>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                trackEvent('promo_apply_click', { placement: 'offer_section' });
                scrollToSection('enquiry');
              }}
            >
              Apply for This Offer
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
