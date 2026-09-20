import { useState } from 'react';
import { capabilities } from '../content/communityContent';
import Icon from '../components/Icon';

/** Desktop loops two equal groups; phones and reduced motion use one swipeable group. */
export default function CapabilityMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="capability-strip" aria-label="What we build">
      <div className="marquee-toolbar container">
        <span className="marquee-label">What we build</span>
        <span className="marquee-hint" aria-hidden="true">Swipe to explore <span aria-hidden="true">&rarr;</span></span>
        <button type="button" className="marquee-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          {paused ? 'Resume motion' : 'Pause motion'}
        </button>
      </div>
      <div className={`marquee ${paused ? 'is-paused' : ''}`} tabIndex={0} role="region" aria-label="Services">
        <div className="marquee-track">
          {[false, true].map(duplicate => (
            <div className={`marquee-group ${duplicate ? 'marquee-duplicate' : ''}`} key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {capabilities.map(capability => (
                <article className="marquee-card" key={capability.title}>
                  <span className="marquee-icon"><Icon name={capability.icon} size={18} /></span>
                  <span className="marquee-text">
                    <strong>{capability.title}</strong>
                    <small>{capability.summary}</small>
                  </span>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
