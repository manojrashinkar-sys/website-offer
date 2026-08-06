import { useEffect, useRef, useState } from 'react';
import { AnalyticsEvent, trackEvent } from '../analytics';
import { config } from '../config';
import { businessTypes } from '../content/businessTypes';
import { attributionSummary } from '../utils/attribution';
import { whatsappLink } from '../utils/whatsapp';
import Icon from '../components/Icon';
import Reveal from './Reveal';
import { scrollToSection } from '../utils/scroll';

const STORAGE_KEY = 'wo_business_type';

/** Remembered for the session so the enquiry form can pre-select it later. */
export function getSelectedBusinessType(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function enquiryMessage(label: string, category: string): string {
  const lines = [
    'Hello, I visited your website-development offer page.',
    '',
    `Business type: ${label}`,
    `Suggested category: ${category}`,
    '',
    'Please share a suitable website recommendation.',
  ];
  const utm = attributionSummary();
  if (utm) lines.push('', utm);
  return lines.join('\n');
}

// Relevance step of the page: a visitor who sees their own kind of business
// listed, with the right pages and features named, is far likelier to enquire
// than one reading generic copy. The selection travels into the WhatsApp
// message and is kept for the enquiry form.
export default function BusinessTypeSelector() {
  const [activeId, setActiveId] = useState(() => getSelectedBusinessType() ?? businessTypes[0].id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const active = businessTypes.find((type) => type.id === activeId) ?? businessTypes[0];

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, activeId);
    } catch {
      // Storage being unavailable must not break selection.
    }
  }, [activeId]);

  const select = (id: string) => {
    setActiveId(id);
    const chosen = businessTypes.find((type) => type.id === id);
    trackEvent(AnalyticsEvent.businessTypeSelected, { business_type: chosen?.label ?? id });
  };

  // Arrow-key navigation, as expected of a tab list.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const index = businessTypes.findIndex((type) => type.id === activeId);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % businessTypes.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + businessTypes.length) % businessTypes.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = businessTypes.length - 1;

    select(businessTypes[next].id);
    tabsRef.current
      ?.querySelectorAll<HTMLButtonElement>('.biz-tab')[next]
      ?.focus();
  };

  return (
    <section className="section section-alt" id="business-fit">
      <div className="container">
        <div className="section-head">
          <h2>Is This Right for Your Business?</h2>
          <p>
            Choose what describes you best to see the pages, features and enquiry style
            that normally suit that kind of business.
          </p>
        </div>

        <div
          className="biz-tabs"
          role="tablist"
          aria-label="Business type"
          ref={tabsRef}
          onKeyDown={onKeyDown}
        >
          {businessTypes.map((type) => (
            <button
              key={type.id}
              role="tab"
              type="button"
              id={`biz-tab-${type.id}`}
              aria-selected={type.id === activeId}
              aria-controls="biz-panel"
              tabIndex={type.id === activeId ? 0 : -1}
              className={`biz-tab ${type.id === activeId ? 'active' : ''}`}
              onClick={() => select(type.id)}
            >
              <Icon name={type.icon} size={17} />
              {type.label}
            </button>
          ))}
        </div>

        <Reveal key={active.id} className="status-card biz-panel">
          <div id="biz-panel" role="tabpanel" aria-labelledby={`biz-tab-${active.id}`} tabIndex={-1}>
            <span className="status-badge review">{active.category}</span>
            <h3 className="biz-panel-title">{active.label}</h3>
            <p className="biz-benefit">{active.benefit}</p>

            <div className="biz-grid">
              <div>
                <h4>Recommended sections</h4>
                <ul className="dot-list">
                  {active.sections.map((section) => (
                    <li key={section}>{section}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Suggested features</h4>
                <ul className="tag-list tag-brand">
                  {active.features.map((feature) => (
                    <li className="tag" key={feature}>{feature}</li>
                  ))}
                </ul>
                <h4>Example call to action</h4>
                <p className="biz-cta-example">“{active.exampleCta}”</p>
              </div>
            </div>

            <div className="biz-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  trackEvent(AnalyticsEvent.applyClick, {
                    placement: 'business_selector',
                    business_type: active.label,
                  });
                  scrollToSection('enquiry');
                }}
              >
                Discuss My Business Website
              </button>
              {config.whatsappNumber && (
                <a
                  className="btn btn-outline"
                  href={whatsappLink(enquiryMessage(active.label, active.category))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent(AnalyticsEvent.whatsappClick, {
                      placement: 'business_selector',
                      business_type: active.label,
                    })
                  }
                >
                  Send on WhatsApp
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
