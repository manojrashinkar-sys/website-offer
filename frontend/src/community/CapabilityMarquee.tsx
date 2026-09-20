import { capabilities } from '../content/communityContent';
import Icon from '../components/Icon';

/**
 * A continuously moving row of what gets built, running edge to edge under
 * the hero.
 *
 * The list is rendered twice and the track slides exactly half its own
 * width before resetting. Because the second half is identical to the first,
 * the reset lands on a pixel-identical frame and the motion never appears to
 * jump — which is the whole trick, and the reason the duplicate is marked
 * aria-hidden rather than removed.
 *
 * It slows to a stop under the pointer, so anything that catches the eye can
 * be read. Under reduced motion it does not move at all and becomes an
 * ordinary horizontal scroller.
 */
export default function CapabilityMarquee() {
  const row = [...capabilities, ...capabilities];

  return (
    <div className="marquee" aria-label="What we build">
      <div className="marquee-track">
        {row.map((capability, index) => (
          <article
            className="marquee-card"
            key={`${capability.title}-${index}`}
            // The second pass is decoration; a screen reader should hear the
            // list once.
            aria-hidden={index >= capabilities.length}
          >
            <span className="marquee-icon"><Icon name={capability.icon} size={18} /></span>
            <span className="marquee-text">
              <strong>{capability.title}</strong>
              <small>{capability.summary}</small>
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
