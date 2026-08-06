import { useState } from 'react';
import { trackEvent } from '../analytics';
import { presencePairs } from '../content/comparison';
import Icon from './Icon';
import Reveal from './Reveal';

type Side = 'without' | 'with';

// Business owners buy on loss avoided more readily than on features. One
// switch, two realities — and the "without" column describes their current
// Tuesday, which is what makes it land.
export default function PresenceComparison() {
  const [side, setSide] = useState<Side>('without');
  const isWith = side === 'with';

  const choose = (next: Side) => {
    setSide(next);
    trackEvent('presence_comparison_toggled', { side: next });
  };

  return (
    <section className="section" id="why-website">
      <div className="container">
        <div className="section-head">
          <h2>What Changes When You Have a Website</h2>
          <p>
            Switch between the two and see which one sounds more like your business today.
          </p>
        </div>

        <div className="cmp-switch" role="group" aria-label="Compare business presence">
          <button
            type="button"
            className={`cmp-switch-btn ${!isWith ? 'active' : ''}`}
            aria-pressed={!isWith}
            onClick={() => choose('without')}
          >
            Without a website
          </button>
          <button
            type="button"
            className={`cmp-switch-btn ${isWith ? 'active' : ''}`}
            aria-pressed={isWith}
            onClick={() => choose('with')}
          >
            With a professional website
          </button>
          <span className={`cmp-switch-thumb ${isWith ? 'right' : ''}`} aria-hidden="true" />
        </div>

        <div className={`cmp-panel ${isWith ? 'is-with' : 'is-without'}`} aria-live="polite">
          {presencePairs.map((pair, index) => (
            <Reveal key={pair.without} delay={(index % 3) * 60} className="cmp-item">
              <span className="cmp-item-icon" aria-hidden="true">
                <Icon name={pair.icon} size={20} />
              </span>
              <p>{isWith ? pair.with : pair.without}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
