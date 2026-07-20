import { offerPoints } from '../content/pageContent';
import Reveal from './Reveal';

export default function OfferSection() {
  return (
    <section className="section offer-section" id="offer">
      <div className="container">
        <Reveal className="status-card">
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
        </Reveal>
      </div>
    </section>
  );
}
