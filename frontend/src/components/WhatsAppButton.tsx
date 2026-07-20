import { trackEvent } from '../analytics';
import { config } from '../config';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';

export default function WhatsAppButton() {
  if (!config.whatsappNumber) return null;

  return (
    <a
      className="whatsapp-fab"
      href={whatsappLink(generalEnquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => trackEvent('promo_whatsapp_click', { placement: 'floating' })}
    >
      {/* Simple inline chat glyph — no external icon library needed. */}
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.02 2 11c0 2.44 1.08 4.65 2.84 6.27L4 22l4.98-1.6c.95.26 1.96.4 3.02.4 5.52 0 10-4.02 10-9S17.52 2 12 2zm-4 8h8v2H8v-2zm0-3h8v2H8V7zm0 6h5v2H8v-2z" />
      </svg>
    </a>
  );
}
