import { useEffect, useRef, useState } from 'react';
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
const STEPS = ['Business', 'Purpose', 'Size', 'Features', 'Domain', 'Timeline'] as const;

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

/** Selections are kept for the session so the enquiry form can read them. */
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

// The centrepiece interaction of the page. A visitor who has spent thirty
// seconds specifying their own requirements is a far warmer lead than one who
// has only read — and they arrive in WhatsApp with the brief already written.
export default function RequirementEstimator() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [state, setState] = useState<State>(load);
  const [started, setStarted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — the estimator still works, it just won't persist.
    }
  }, [state]);

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    if (!started) {
      setStarted(true);
      trackEvent(AnalyticsEvent.estimatorStarted);
    }
    setState((current) => ({ ...current, [key]: value }));
  };

  const toggleFeature = (id: string) => {
    if (!started) {
      setStarted(true);
      trackEvent(AnalyticsEvent.estimatorStarted);
    }
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

  const answered = [state.business, state.purpose, state.pages, state.guidance, state.timeline];
  const canAdvance = step === 3 ? true : Boolean(answered[step > 3 ? step - 1 : step]);

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      // Move focus to the new question so keyboard and screen-reader users
      // are not left behind at the button they just pressed.
      requestAnimationFrame(() => panelRef.current?.focus());
      return;
    }
    setDone(true);
    trackEvent(AnalyticsEvent.estimatorCompleted, {
      tier: result.tier,
      business_type: state.business,
      feature_count: state.features.length,
    });
    requestAnimationFrame(() => panelRef.current?.focus());
  };

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

  const restart = () => {
    setState(EMPTY);
    setStep(0);
    setDone(false);
    setStarted(false);
  };

  return (
    <section className="section" id="estimator">
      <div className="container">
        <div className="section-head">
          <h2>Build Your Website Requirement</h2>
          <p>
            Six quick questions. You will get a recommended solution category and can send
            the whole brief to us in one tap — no price guesswork, no obligation.
          </p>
        </div>

        <div className="est-card">
          {!done && (
            <div className="est-progress">
              <ol className="est-steps">
                {STEPS.map((name, index) => (
                  <li
                    key={name}
                    className={`est-step ${index === step ? 'current' : ''} ${index < step ? 'complete' : ''}`}
                  >
                    <span className="est-step-dot" aria-hidden="true">
                      {index < step ? '✓' : index + 1}
                    </span>
                    <span className="est-step-label">{name}</span>
                  </li>
                ))}
              </ol>
              <div className="est-bar" aria-hidden="true">
                <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
              <p className="sr-only" aria-live="polite">
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </p>
            </div>
          )}

          <div className="est-panel" ref={panelRef} tabIndex={-1}>
            {!done && step === 0 && (
              <Question legend="What kind of business is this for?">
                {businessTypes.map((type) => (
                  <Option
                    key={type.id}
                    name="est-business"
                    label={type.label}
                    icon={type.icon}
                    checked={state.business === type.label}
                    onChange={() => set('business', type.label)}
                  />
                ))}
              </Question>
            )}

            {!done && step === 1 && (
              <Question legend="What should the website mainly do?">
                {purposes.map((choice) => (
                  <Option
                    key={choice.id}
                    name="est-purpose"
                    label={choice.label}
                    icon={choice.icon}
                    checked={state.purpose === choice.id}
                    onChange={() => set('purpose', choice.id)}
                  />
                ))}
              </Question>
            )}

            {!done && step === 2 && (
              <Question legend="Roughly how many pages?">
                {pageCounts.map((choice) => (
                  <Option
                    key={choice.id}
                    name="est-pages"
                    label={choice.label}
                    hint={choice.hint}
                    checked={state.pages === choice.id}
                    onChange={() => set('pages', choice.id)}
                  />
                ))}
              </Question>
            )}

            {!done && step === 3 && (
              <Question legend="Which features do you need?" hint="Select any that apply.">
                {featureChoices.map((choice) => (
                  <Option
                    key={choice.id}
                    type="checkbox"
                    name={`est-feature-${choice.id}`}
                    label={choice.label}
                    icon={choice.icon}
                    checked={state.features.includes(choice.id)}
                    onChange={() => toggleFeature(choice.id)}
                  />
                ))}
              </Question>
            )}

            {!done && step === 4 && (
              <Question legend="Do you need help with domain and hosting?">
                {guidanceChoices.map((choice) => (
                  <Option
                    key={choice.id}
                    name="est-guidance"
                    label={choice.label}
                    checked={state.guidance === choice.id}
                    onChange={() => set('guidance', choice.id)}
                  />
                ))}
              </Question>
            )}

            {!done && step === 5 && (
              <Question legend="When would you like to launch?">
                {timelines.map((choice) => (
                  <Option
                    key={choice.id}
                    name="est-timeline"
                    label={choice.label}
                    checked={state.timeline === choice.id}
                    onChange={() => set('timeline', choice.id)}
                  />
                ))}
              </Question>
            )}

            {done && (
              <div className="est-result">
                <span className={`est-tier est-tier-${result.tier.toLowerCase()}`}>
                  {result.tier}
                </span>
                <h3>{result.category}</h3>
                <p className="est-summary">{result.summary}</p>

                <dl className="est-recap">
                  <div><dt>Business</dt><dd>{state.business}</dd></div>
                  <div><dt>Purpose</dt><dd>{labelOf(purposes, state.purpose)}</dd></div>
                  <div><dt>Pages</dt><dd>{labelOf(pageCounts, state.pages)}</dd></div>
                  <div><dt>Timeline</dt><dd>{labelOf(timelines, state.timeline)}</dd></div>
                </dl>

                {state.features.length > 0 && (
                  <>
                    <h4>Features included</h4>
                    <ul className="tag-list tag-brand">
                      {state.features.map((id) => (
                        <li className="tag" key={id}>{labelOf(featureChoices, id)}</li>
                      ))}
                    </ul>
                  </>
                )}

                <h4>Recommended approach</h4>
                <p className="est-approach">{result.approach}</p>

                <p className="est-note">
                  This is a requirement summary, not a quotation. The final scope and cost
                  are confirmed in writing after we discuss your project.
                </p>

                <div className="est-actions">
                  {config.whatsappNumber && (
                    <a
                      className="btn btn-primary btn-glow"
                      href={whatsappLink(message())}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent(AnalyticsEvent.whatsappClick, { placement: 'estimator', tier: result.tier })
                      }
                    >
                      Get Exact Quote on WhatsApp
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
                    Send by Form Instead
                  </button>
                  <button className="btn-link" type="button" onClick={restart}>
                    Start again
                  </button>
                </div>
              </div>
            )}
          </div>

          {!done && (
            <div className="est-nav">
              <button
                className="btn btn-outline btn-sm"
                type="button"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Back
              </button>
              <span className="est-count">Step {step + 1} of {STEPS.length}</span>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
              >
                {step === STEPS.length - 1 ? 'See Recommendation' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Question({
  legend, hint, children,
}: { legend: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="est-question">
      <legend>{legend}</legend>
      {hint && <p className="est-hint">{hint}</p>}
      <div className="est-options">{children}</div>
    </fieldset>
  );
}

function Option({
  type = 'radio', name, label, hint, icon, checked, onChange,
}: {
  type?: 'radio' | 'checkbox';
  name: string;
  label: string;
  hint?: string;
  icon?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`est-option ${checked ? 'checked' : ''}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      {icon && (
        <span className="est-option-icon" aria-hidden="true">
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className="est-option-text">
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <span className="est-option-tick" aria-hidden="true">✓</span>
    </label>
  );
}
