import { Link } from 'react-router-dom';
import { trackEvent } from '../../analytics';
import { config } from '../../config';
import { useDiscussAction } from '../../hooks/useDiscussAction';
import { generalEnquiryMessage, whatsappLink } from '../../utils/whatsapp';

export default function RoadmapCta() {
  const discuss = useDiscussAction('roadmap_closing_cta');

  return (
    <section className="section closing-cta">
      <div className="container">
        <div className="closing-cta-card">
          <h2>Ready to Plan Your Website?</h2>
          <p>
            Get a website architecture selected according to your business requirements,
            budget, current priorities, and future growth.
          </p>
          <div className="closing-cta-actions">
            <button className="btn btn-primary btn-lg btn-glow" type="button" onClick={discuss}>
              Discuss Your Website
            </button>
            <Link
              className="btn btn-outline btn-lg"
              to={config.offerRoute}
              onClick={() => trackEvent('roadmap_offer_link_click', { placement: 'closing_cta' })}
            >
              View Current Website Offer
            </Link>
            {config.whatsappNumber && (
              <a
                className="btn btn-whatsapp btn-lg"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'roadmap_closing_cta' })}
              >
                Ask on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
