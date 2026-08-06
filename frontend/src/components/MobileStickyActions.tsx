import { config } from '../config';
import { AnalyticsEvent, trackEvent } from '../analytics';
import { useDiscussAction } from '../hooks/useDiscussAction';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import Icon from './Icon';

// Bottom conversion bar for phones. The page reserves space for it (see
// .offer-page padding in mobile.css) so it can never sit on top of the footer
// or the last field of the enquiry form.
//
// It replaces the floating WhatsApp button below 900px rather than joining it —
// two overlapping WhatsApp affordances in one corner is clutter, not emphasis.
export default function MobileStickyActions() {
  const getQuote = useDiscussAction('mobile_sticky');
  const hasPhone = Boolean(config.contactPhone);
  const hasWhatsapp = Boolean(config.whatsappNumber);

  return (
    <div className="sticky-actions" role="group" aria-label="Contact actions">
      {hasPhone && (
        <a
          className="sticky-action"
          href={`tel:${config.contactPhone}`}
          onClick={() => trackEvent(AnalyticsEvent.phoneClick, { placement: 'mobile_sticky' })}
        >
          <Icon name="phone" size={19} />
          <span>Call</span>
        </a>
      )}

      {hasWhatsapp && (
        <a
          className="sticky-action sticky-action-wa"
          href={whatsappLink(generalEnquiryMessage())}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(AnalyticsEvent.whatsappClick, { placement: 'mobile_sticky' })}
        >
          <Icon name="chat" size={19} />
          <span>WhatsApp</span>
        </a>
      )}

      <button type="button" className="sticky-action sticky-action-cta" onClick={getQuote}>
        <Icon name="edit" size={19} />
        <span>Get Quote</span>
      </button>
    </div>
  );
}
