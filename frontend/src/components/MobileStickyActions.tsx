import { config } from '../config';
import { AnalyticsEvent, trackEvent } from '../analytics';
import { useDiscussAction } from '../hooks/useDiscussAction';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import Icon from './Icon';

/**
 * The number the Call action dials.
 *
 * VITE_CONTACT_PHONE is the intended source, but it is easy to leave unset on
 * a host — and when it was, the Call action silently disappeared and the bar
 * came up with two items instead of three. The WhatsApp number is the same
 * business line, so it stands in rather than dropping the action entirely.
 */
function callNumber(): string {
  const raw = config.contactPhone || config.whatsappNumber;
  if (!raw) return '';
  const trimmed = raw.trim();
  // wa.me numbers carry a country code but no plus; tel: needs one.
  return trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/\D/g, '')}`;
}

// Bottom conversion bar for phones, on the roadmap page only. That page
// reserves space for it (see the .roadmap-page padding in mobile.css) so it
// can never sit on top of the footer.
//
// It replaces the floating WhatsApp button there rather than joining it — two
// overlapping WhatsApp affordances in one corner is clutter, not emphasis.
export default function MobileStickyActions() {
  const getQuote = useDiscussAction('mobile_sticky');
  const phone = callNumber();
  const hasWhatsapp = Boolean(config.whatsappNumber);

  return (
    <div className="sticky-actions" role="group" aria-label="Contact actions">
      {phone && (
        <a
          className="sticky-action"
          href={`tel:${phone}`}
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
