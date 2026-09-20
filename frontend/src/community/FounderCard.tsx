import { config } from '../config';
import { trackEvent } from '../analytics';
import { founder, serviceAreas } from '../content/communityContent';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import SafeImage from './SafeImage';
import Icon from '../components/Icon';

/**
 * The hero aside on the home page.
 *
 * It replaces a panel that listed the four capabilities — the same four the
 * section immediately below shows as full cards. Saying the same thing twice
 * in one screen was not earning the space, and it was the least persuasive
 * thing that could have occupied it.
 *
 * This is the opposite: a face, a name, and the towns the work has actually
 * happened in. Evidence rather than claims, and the one thing on the page an
 * agency cannot reproduce.
 */
export default function FounderCard() {
  return (
    <aside className="founder-card">
      {/* One link around the photograph and the name together, rather than
          two adjacent links to the same place — which is what a screen reader
          would announce it as, and what a keyboard user would have to tab
          past twice. */}
      <a
        className="founder-card-head"
        href={founder.portfolio}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('community_founder_link_click', { placement: 'founder_card' })}
      >
        <SafeImage
          className="founder-card-photo"
          src={founder.photo.src}
          alt={founder.photo.alt}
          width={1254}
          height={1254}
        />
        <span className="founder-card-id">
          <strong>{founder.name}</strong>
          <small>{founder.role}</small>
          <span className="founder-card-visit">
            View portfolio
            <Icon name="arrow-right" size={13} />
          </span>
        </span>
      </a>

      <p className="founder-card-line">{founder.line}</p>

      <ul className="founder-card-places" aria-label="Where projects have been delivered">
        {serviceAreas.places.map((place) => (
          <li key={place}>
            <Icon name="map-pin" size={13} />
            {place}
          </li>
        ))}
      </ul>

      {config.whatsappNumber && (
        <a
          className="founder-card-action"
          href={whatsappLink(generalEnquiryMessage())}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('promo_whatsapp_click', { placement: 'community_founder_card' })}
        >
          <Icon name="chat" size={16} />
          Message me directly
        </a>
      )}
    </aside>
  );
}
