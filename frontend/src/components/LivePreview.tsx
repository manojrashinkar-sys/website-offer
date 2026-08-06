import { useId, useState } from 'react';
import { AnalyticsEvent, trackEvent } from '../analytics';
import { config } from '../config';
import { attributionSummary } from '../utils/attribution';
import { whatsappLink } from '../utils/whatsapp';
import Reveal from './Reveal';

const PLACEHOLDER = 'Your Business';

/** "Sharma Traders" → "sharmatraders.in". Trimmed so long names stay readable. */
function toDomain(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 22);
  return `${slug || 'yourbusiness'}.in`;
}

function enquiry(name: string): string {
  const lines = [
    'Hello, I am interested in a website for my business.',
    '',
    `Business name: ${name || 'To be confirmed'}`,
    '',
    'Please share what it would involve.',
  ];
  const utm = attributionSummary();
  if (utm) lines.push('', utm);
  return lines.join('\n');
}

// Non-technical owners struggle to picture their own website, and that gap is
// where most enquiries are lost. Typing a name and watching it appear removes
// the imagination step entirely.
//
// The mockup is built from the .browser-frame / .mock-* classes already in
// offer.css, so it inherits the site's visual language rather than adding one.
export default function LivePreview() {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const inputId = useId();
  const shown = name.trim() || PLACEHOLDER;

  const onChange = (value: string) => {
    setName(value.slice(0, 28));
    if (!touched && value.trim()) {
      setTouched(true);
      trackEvent('live_preview_used');
    }
  };

  return (
    <section className="section preview-section" id="see-it">
      <div className="container">
        <div className="preview-grid">
          <div className="preview-copy">
            <div className="section-head">
              <h2>See Your Business Online</h2>
              <p>
                Type your business name and watch it appear. This is a simplified
                impression, not a finished design — but it is how your customers would
                first meet you.
              </p>
            </div>

            <div className="preview-field">
              <label htmlFor={inputId}>Your business name</label>
              <input
                id={inputId}
                type="text"
                value={name}
                autoComplete="organization"
                placeholder="e.g. Sharma Traders"
                onChange={(event) => onChange(event.target.value)}
              />
              <p className="field-hint">Nothing is sent anywhere until you choose to contact us.</p>
            </div>

            <div className="preview-actions">
              {config.whatsappNumber && (
                <a
                  className="btn btn-primary"
                  href={whatsappLink(enquiry(name.trim()))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent(AnalyticsEvent.whatsappClick, { placement: 'live_preview' })
                  }
                >
                  Build This For My Business
                </a>
              )}
            </div>
          </div>

          <Reveal className="preview-stage">
            <div className="browser-frame">
              <div className="browser-bar">
                <span className="dot" /><span className="dot" /><span className="dot" />
                <span className="browser-url">{toDomain(name.trim())}</span>
              </div>
              <div className="browser-body">
                <div className="mock-topbar">
                  <span className="mock-brand">{shown}</span>
                  <span className="mock-menu" aria-hidden="true">
                    <i /><i /><i />
                  </span>
                </div>
                <div className="mock-hero">
                  <p className="mock-headline">
                    Welcome to <strong>{shown}</strong>
                  </p>
                  <div className="mock-line w-70" />
                  <div className="mock-line w-50" />
                  <div className="mock-btn-row">
                    <span className="mock-btn" />
                    <span className="mock-btn ghost" />
                  </div>
                </div>
                <div className="mock-cards">
                  <span className="mock-card" />
                  <span className="mock-card" />
                  <span className="mock-card" />
                </div>
              </div>
            </div>

            <div className="phone-frame" aria-hidden="true">
              <span className="phone-notch" />
              <div className="phone-body">
                <p className="mock-brand mock-brand-sm">{shown}</p>
                <div className="mock-line w-70" />
                <div className="mock-btn full" />
                <div className="mock-cards">
                  <span className="mock-card" />
                  <span className="mock-card" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
