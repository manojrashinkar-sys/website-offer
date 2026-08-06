import { useEffect, useState } from 'react';
import { AnalyticsEvent, trackEvent } from '../analytics';
import { config } from '../config';
import { businessTypes } from '../content/businessTypes';
import {
  featureChoices, guidanceChoices, pageCounts, purposes, recommend, timelines,
  type Choice,
} from '../content/estimator';
import { attributionSummary } from '../utils/attribution';
import { whatsappLink } from '../utils/whatsapp';
import { scrollToSection } from '../utils/scroll';
import Icon from './Icon';

const STORAGE_KEY = 'wo_estimator';

interface State {
  business: string;
  purpose: string;
  pages: string;
  features: string[];
  guidance: string;
  timeline: string;
}

const EMPTY: State = { business: '', purpose: '', pages: '', features: [], guidance: '', timeline: '' };

function load(): State {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as State) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const labelOf = (list: readonly Choice[], id: string) =>
  list.find((choice) => choice.id === id)?.label ?? '';
const weightOf = (list: readonly Choice[], id: string) =>
  list.find((choice) => choice.id === id)?.weight ?? 0;

export function getEstimatorSummary(): string {
  const state = load();
  if (!state.business) return '';
  const features = state.features.map((id) => labelOf(featureChoices, id)).join(', ');
  return [
    `Business type: ${state.business}`,
    `Purpose: ${labelOf(purposes, state.purpose)}`,
    `Pages: ${labelOf(pageCounts, state.pages)}`,
    `Features: ${features || 'Not specified'}`,
    `Timeline: ${labelOf(timelines, state.timeline)}`,
  ].join('\n');
}

// Everything on one screen, with the recommendation resolving live beside the
// questions. A Next/Back wizard hides the shape of what is being asked, makes
// people commit before they can see where it leads, and turns a thirty-second
// task into six page-loads' worth of clicking.
export default function RequirementEstimator() {
  const [state, setState] = useState<State>(load);
  const [started, setStarted] = useState(false);
  const [completedFired, setCompletedFired] = useState(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — the estimator still works, it just won't persist.
    }
  }, [state]);

  const begin = () => {
    if (started) return;
    setStarted(true);
    trackEvent(AnalyticsEvent.estimatorStarted);
  };

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    begin();
    setState((current) => ({ ...current, [key]: value }));
  };

  const toggleFeature = (id: string) => {
    begin();
    setState((current) => ({
      ...current,
      features: current.features.includes(id)
        ? current.features.filter((item) => item !== id)
        : [...current.features, id],
    }));
  };

  const score =
    weightOf(purposes, state.purpose) +
    weightOf(pageCounts, state.pages) +
    state.features.reduce((total, id) => total + weightOf(featureChoices, id), 0);
  const needsBackend =
    purposes.some((choice) => choice.id === state.purpose && choice.backend) ||
    state.features.some((id) => featureChoices.some((choice) => choice.id === id && choice.backend));
  const result = recommend(score, needsBackend);

  const required = [state.business, state.purpose, state.pages, state.guidance, state.timeline];
  const answeredCount = required.filter(Boolean).length;
  const complete = answeredCount === required.length;

  useEffect(() => {
    if (complete && !completedFired) {
      setCompletedFired(true);
      trackEvent(AnalyticsEvent.estimatorCompleted, {
        tier: result.tier,
        business_type: state.business,
        feature_count: state.features.length,
      });
    }
  }, [complete, completedFired, result.tier, state.business, state.features.length]);

  const message = () => {
    const lines = [
      'Hello, I am interested in a business website.',
      '',
      `Business type: ${state.business}`,
      `Website purpose: ${labelOf(purposes, state.purpose)}`,
      `Pages: ${labelOf(pageCounts, state.pages)}`,
      `Required features: ${state.features.map((id) => labelOf(featureChoices, id)).join(', ') || 'To be discussed'}`,
      `Domain and hosting: ${labelOf(guidanceChoices, state.guidance)}`,
      `Timeline: ${labelOf(timelines, state.timeline)}`,
      `Suggested category: ${result.category}`,
      '',
      'Please share a suitable proposal.',
    ];
    const utm = attributionSummary();
    if (utm) lines.push('', utm);
    return lines.join('\n');
  };

  return (
    <section className="section" id="estimator">
      <div className="container">
        <div className="section-head">
          <h2>Build Your Website Requirement</h2>
          <p>
            Answer what you can — the recommendation updates as you go. Nothing is
            submitted until you choose to send it.
          </p>
        </div>

        <div className="est-layout">
          <div className="est-questions">
            <Field index={1} legend="What kind of business is this for?" done={Boolean(state.business)}>
              {businessTypes.map((type) => (
                <Chip
                  key={type.id}
                  label={type.label}
                  checked={state.business === type.label}
                  onSelect={() => set('business', type.label)}
                />
              ))}
            </Field>

            <Field index={2} legend="What should it mainly do?" done={Boolean(state.purpose)}>
              {purposes.map((choice) => (
                <Chip
                  key={choice.id}
                  label={choice.label}
                  checked={state.purpose === choice.id}
                  onSelect={() => set('purpose', choice.id)}
                />
              ))}
            </Field>

            <Field index={3} legend="Roughly how many pages?" done={Boolean(state.pages)}>
              {pageCounts.map((choice) => (
                <Chip
                  key={choice.id}
                  label={choice.label}
                  checked={state.pages === choice.id}
                  onSelect={() => set('pages', choice.id)}
                />
              ))}
            </Field>

            <Field
              index={4}
              legend="Which features do you need?"
              hint="Optional — choose any that apply."
              done={state.features.length > 0}
            >
              {featureChoices.map((choice) => (
                <Chip
                  key={choice.id}
                  type="checkbox"
                  label={choice.label}
                  icon={choice.icon}
                  checked={state.features.includes(choice.id)}
                  onSelect={() => toggleFeature(choice.id)}
                />
              ))}
            </Field>

            <Field index={5} legend="Need help with domain and hosting?" done={Boolean(state.guidance)}>
              {guidanceChoices.map((choice) => (
                <Chip
                  key={choice.id}
                  label={choice.label}
                  checked={state.guidance === choice.id}
                  onSelect={() => set('guidance', choice.id)}
                />
              ))}
            </Field>

            <Field index={6} legend="When would you like to launch?" done={Boolean(state.timeline)}>
              {timelines.map((choice) => (
                <Chip
                  key={choice.id}
                  label={choice.label}
                  checked={state.timeline === choice.id}
                  onSelect={() => set('timeline', choice.id)}
                />
              ))}
            </Field>
          </div>

          <aside className="est-result-panel" aria-label="Your recommendation">
            <div className="est-result-inner">
              <p className="est-result-eyebrow">Your recommendation</p>

              <div className="est-readout" aria-live="polite">
                {started ? (
                  <>
                    <span className={`est-tier est-tier-${result.tier.toLowerCase()}`}>{result.tier}</span>
                    <h3>{result.category}</h3>
                    <p className="est-summary">{result.summary}</p>
                  </>
                ) : (
                  <>
                    <h3 className="est-idle">Start choosing</h3>
                    <p className="est-summary">
                      Your recommended category will appear here and update with every choice.
                    </p>
                  </>
                )}
              </div>

              <div className="est-meter" aria-hidden="true">
                <span style={{ width: `${(answeredCount / required.length) * 100}%` }} />
              </div>
              <p className="est-meter-label">
                {complete ? 'All answered' : `${answeredCount} of ${required.length} answered`}
              </p>

              {started && (
                <dl className="est-recap">
                  {state.business && <Recap term="Business" value={state.business} />}
                  {state.pages && <Recap term="Pages" value={labelOf(pageCounts, state.pages)} />}
                  {state.features.length > 0 && (
                    <Recap term="Features" value={`${state.features.length} selected`} />
                  )}
                  {state.timeline && <Recap term="Timeline" value={labelOf(timelines, state.timeline)} />}
                </dl>
              )}

              <div className="est-actions">
                {config.whatsappNumber && (
                  <a
                    className={`btn btn-primary ${complete ? 'btn-glow' : ''}`}
                    href={whatsappLink(message())}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent(AnalyticsEvent.whatsappClick, { placement: 'estimator', tier: result.tier })
                    }
                  >
                    Send This Brief on WhatsApp
                  </a>
                )}
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    trackEvent(AnalyticsEvent.applyClick, { placement: 'estimator', tier: result.tier });
                    scrollToSection('enquiry');
                  }}
                >
                  Use the Form Instead
                </button>
              </div>

              <p className="est-note">
                A requirement summary, not a quotation. Final scope and cost are confirmed
                in writing after we talk.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Recap({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  index, legend, hint, done, children,
}: {
  index: number; legend: string; hint?: string; done: boolean; children: React.ReactNode;
}) {
  return (
    <fieldset className={`est-field ${done ? 'done' : ''}`}>
      <legend>
        <span className="est-field-num" aria-hidden="true">{done ? '✓' : index}</span>
        <span className="est-field-legend">{legend}</span>
      </legend>
      {hint && <p className="est-hint">{hint}</p>}
      <div className="est-chips">{children}</div>
    </fieldset>
  );
}

function Chip({
  type = 'radio', label, icon, checked, onSelect,
}: {
  type?: 'radio' | 'checkbox';
  label: string;
  icon?: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`est-chip ${checked ? 'checked' : ''}`}>
      <input type={type} checked={checked} onChange={onSelect} />
      {icon && <Icon name={icon} size={15} />}
      <span>{label}</span>
    </label>
  );
}
