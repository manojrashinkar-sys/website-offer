import { trackEvent } from '../analytics';
import { config } from '../config';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import { scrollToSection } from './OfferHeader';

export default function ClosingCta() {
  return (
    <section className="section closing-cta">
      <div className="container">
        <div className="closing-cta-card">
          <h2>Ready to get your business online?</h2>
          <p>Applications are reviewed individually — there's no cost to applying.</p>
          <div className="closing-cta-actions">
            <button
              className="btn btn-primary btn-lg btn-glow"
              onClick={() => {
                trackEvent('promo_apply_click', { placement: 'closing_cta' });
                scrollToSection('enquiry');
              }}
            >
              Apply for Your Website
            </button>
            {config.whatsappNumber && (
              <a
                className="btn btn-whatsapp btn-lg"
                href={whatsappLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'closing_cta' })}
              >
                Ask a Question on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
