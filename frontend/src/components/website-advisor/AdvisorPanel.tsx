import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../analytics';
import { config } from '../../config';
import { whatsappLink } from '../../utils/whatsapp';
import {
  bestFaqAnswer, businessRules, faqCategories, faqs, getFaq, portfolioInfo,
  recommend, recommendationQuestions, searchFaqs,
  type FaqItem, type Recommendation, type RecommendationAnswers,
} from '../../lib/advisor/engine';
import { buildSummary, summaryMessage, type LeadSummary } from '../../lib/advisor/leadSummary';
import {
  customQuestionsRemaining, LIMITS, quickActions, recordCustomQuestion,
} from '../../lib/advisor/session';
import roadmap from '../../data/roadmap.json';
import technologies from '../../data/technologies.json';
import Icon from '../Icon';

type Block =
  | { kind: 'advisor'; text: string; id: string }
  | { kind: 'visitor'; text: string; id: string }
  | { kind: 'faq-list'; items: FaqItem[]; id: string }
  | { kind: 'recommendation'; value: Recommendation; id: string }
  | { kind: 'summary'; value: LeadSummary; id: string };

// Omit over a union collapses it into the intersection of its members, which
// would reject every valid block. Distributing it keeps each variant intact.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type NewBlock = DistributiveOmit<Block, 'id'>;

let blockId = 0;
const nextId = () => `b${(blockId += 1)}`;

const GREETING =
  'I can help you work out what kind of website your business needs, how it would be built, ' +
  'and what it involves. Pick a topic below, or ask your own question.';

export default function AdvisorPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [blocks, setBlocks] = useState<Block[]>([
    { kind: 'advisor', text: GREETING, id: nextId() },
  ]);
  const [mode, setMode] = useState<'menu' | 'recommend' | 'custom'>('menu');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RecommendationAnswers>({ features: [] });
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(customQuestionsRemaining());
  const [cooldown, setCooldown] = useState(0);
  const [aiDown, setAiDown] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const push = useCallback((block: NewBlock) => {
    setBlocks((current) => [...current, { ...block, id: nextId() } as Block]);
  }, []);

  // Reads a single-choice answer by question id. The features question is
  // multi-select and lives on its own typed field, so it is handled separately.
  const answerFor = (id: string): string | undefined =>
    (answers as unknown as Record<string, string | undefined>)[id];

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [blocks, busy]);

  // Escape closes, and Tab is kept inside the dialog while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea') ?? [],
      ).filter((element) => element.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  /* ---------- actions ---------- */

  const answerFaq = (item: FaqItem) => {
    push({ kind: 'visitor', text: item.question });
    push({ kind: 'advisor', text: item.answer });
    const follows = item.followUpQuestions.map(getFaq).filter(Boolean) as FaqItem[];
    if (follows.length) push({ kind: 'faq-list', items: follows });
    trackEvent('faq_selected', { faq_id: item.id, category: item.category });
  };

  const runQuickAction = (action: (typeof quickActions)[number]) => {
    trackEvent('advisor_quick_action', { action: action.id });
    setMode('menu');

    if (action.kind === 'faq' && action.faqId) {
      const item = getFaq(action.faqId);
      if (item) answerFaq(item);
      return;
    }
    if (action.kind === 'recommendation') {
      setMode('recommend'); setStep(0); setAnswers({ features: [] });
      push({ kind: 'visitor', text: 'Help me find the right website' });
      push({ kind: 'advisor', text: 'Three quick questions and I will suggest a suitable setup.' });
      trackEvent('recommendation_started');
      return;
    }
    if (action.kind === 'roadmap') {
      push({ kind: 'visitor', text: 'How does the development process work?' });
      push({
        kind: 'advisor',
        text:
          `A project runs through ${roadmap.length} stages, from business discovery to future scaling. ` +
          'The early ones — discovery, requirements and content — decide most of the outcome. ' +
          'Development, testing, domain setup and launch follow, then handover and optional support.\n\n' +
          'The full stage-by-stage breakdown is on the Development Roadmap page, including what we do and what you provide at each stage.',
      });
      return;
    }
    if (action.kind === 'technology') {
      const core = (technologies as Array<Record<string, unknown>>).filter((tech) => !tech.requiresPaidInfrastructure);
      push({ kind: 'visitor', text: 'Which technologies would my website use?' });
      push({
        kind: 'advisor',
        text:
          'Most business websites need only these:\n\n' +
          core.slice(0, 5).map((tech) => `• ${tech.name} — ${tech.businessBenefit}`).join('\n') +
          '\n\nServers, databases and container tooling exist for projects that genuinely need them. ' +
          'We do not add paid infrastructure unless your project actually requires it.',
      });
      return;
    }
    if (action.kind === 'custom') {
      setMode('custom');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const chooseOption = (questionId: string, value: string, multi?: boolean) => {
    setAnswers((current) => {
      if (!multi) return { ...current, [questionId]: value };
      const has = current.features.includes(value);
      return { ...current, features: has ? current.features.filter((f) => f !== value) : [...current.features, value] };
    });
  };

  const advanceRecommendation = () => {
    if (step < recommendationQuestions.length - 1) { setStep(step + 1); return; }
    const result = recommend(answers);
    push({ kind: 'recommendation', value: result });
    setMode('menu');
    trackEvent('recommendation_completed', {
      tier: result.tier,
      backend: result.backendRequired,
      business_type: answers.businessType ?? 'unspecified',
    });
  };

  const makeSummary = (value: Recommendation) => {
    const summary = buildSummary(answers, value);
    push({ kind: 'summary', value: summary });
    trackEvent('lead_summary_created', { tier: value.tier });
  };

  const askCustom = async () => {
    const question = draft.trim();
    if (!question || busy || cooldown > 0) return;
    if (remaining <= 0) return;

    // Answer locally when the knowledge base clearly covers it — that keeps the
    // visitor's limited AI questions for things it genuinely cannot.
    const local = bestFaqAnswer(question);
    if (local) {
      push({ kind: 'visitor', text: question });
      push({ kind: 'advisor', text: local.answer });
      setDraft('');
      trackEvent('faq_selected', { faq_id: local.id, category: local.category, via: 'custom_input' });
      return;
    }

    push({ kind: 'visitor', text: question });
    setDraft('');
    setBusy(true);
    trackEvent('custom_ai_question');

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as { answer?: string };
      if (!data.answer) throw new Error('empty');

      push({ kind: 'advisor', text: data.answer });
      const left = recordCustomQuestion();
      setRemaining(left);
      if (left === 0) trackEvent('ai_limit_reached');
    } catch {
      // No raw error is ever shown — the visitor gets a route forward instead.
      setAiDown(true);
      trackEvent('ai_error');
      const related = searchFaqs(question, 3).map((match) => match.item);
      push({
        kind: 'advisor',
        text: 'Custom guidance is temporarily unavailable. You can still use the recommendations and common questions — or send this straight to us.',
      });
      if (related.length) push({ kind: 'faq-list', items: related });
    } finally {
      setBusy(false);
      setCooldown(LIMITS.cooldownSeconds);
    }
  };

  const waHref = (message: string) => whatsappLink(message);
  const question = recommendationQuestions[step];
  const canAdvance = question?.multi
    ? answers.features.length > 0
    : Boolean(answerFor(question?.id ?? ''));

  return (
    <>
      {open && <div className="advisor-scrim" onClick={onClose} aria-hidden="true" />}
      <div
        className={`advisor-panel ${open ? 'open' : ''}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Website Advisor"
        aria-hidden={!open}
      >
        <header className="advisor-head">
          <span className="advisor-head-mark" aria-hidden="true"><Icon name="compass" size={18} /></span>
          <span className="advisor-head-text">
            <strong>Website Advisor</strong>
            <small>Instant guidance for your website project</small>
          </span>
          <button type="button" className="advisor-close" onClick={onClose} aria-label="Close Website Advisor">
            <Icon name="close" size={17} />
          </button>
        </header>

        <div className="advisor-stream" ref={streamRef}>
          {blocks.map((block) => {
            if (block.kind === 'visitor') {
              return <p className="advisor-msg advisor-msg-visitor" key={block.id}>{block.text}</p>;
            }
            if (block.kind === 'advisor') {
              return (
                <div className="advisor-msg advisor-msg-bot" key={block.id}>
                  {block.text.split('\n\n').map((para, index) => <p key={index}>{para}</p>)}
                </div>
              );
            }
            if (block.kind === 'faq-list') {
              return (
                <div className="advisor-suggestions" key={block.id}>
                  {block.items.map((item) => (
                    <button type="button" key={item.id} className="advisor-chip" onClick={() => answerFaq(item)}>
                      {item.question}
                    </button>
                  ))}
                </div>
              );
            }
            if (block.kind === 'recommendation') {
              const value = block.value;
              return (
                <div className="advisor-card" key={block.id}>
                  <span className="advisor-card-tag">{value.tier}</span>
                  <h4>{value.websiteTypeName}</h4>
                  <p className="advisor-card-reason">{value.reason}</p>
                  <dl className="advisor-card-spec">
                    <div><dt>Architecture</dt><dd>{value.architecture}</dd></div>
                    <div><dt>Backend</dt><dd>{value.backendRequired ? 'Required' : 'Not required initially'}</dd></div>
                    <div><dt>Database</dt><dd>{value.databaseRequired ? 'Required' : 'Not required initially'}</dd></div>
                  </dl>
                  {value.typicalPages.length > 0 && (
                    <>
                      <h5>Typical pages</h5>
                      <p className="advisor-card-list">{value.typicalPages.join(' · ')}</p>
                    </>
                  )}
                  <div className="advisor-card-actions">
                    <button type="button" className="advisor-btn advisor-btn-primary" onClick={() => makeSummary(value)}>
                      Build my requirement summary
                    </button>
                  </div>
                </div>
              );
            }
            const summary = block.value;
            return (
              <div className="advisor-card" key={block.id}>
                <span className="advisor-card-tag">Requirement summary</span>
                <dl className="advisor-card-spec">
                  <div><dt>Business type</dt><dd>{summary.businessType}</dd></div>
                  <div><dt>Main goal</dt><dd>{summary.goal}</dd></div>
                  <div><dt>Features</dt><dd>{summary.features.length ? summary.features.join(', ') : 'To be discussed'}</dd></div>
                  <div><dt>Suggested website</dt><dd>{summary.recommendation.websiteTypeName}</dd></div>
                  <div><dt>Architecture</dt><dd>{summary.recommendation.architecture}</dd></div>
                </dl>
                <p className="advisor-card-note">Review this, then send it across — nothing is submitted until you do.</p>
                <div className="advisor-card-actions">
                  {config.whatsappNumber && (
                    <a
                      className="advisor-btn advisor-btn-wa"
                      href={waHref(summaryMessage(summary))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_clicked', { placement: 'advisor_summary' })}
                    >
                      Send on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {busy && (
            <p className="advisor-typing" role="status" aria-live="polite">
              <span /><span /><span />
              <span className="sr-only">Thinking</span>
            </p>
          )}
        </div>

        <div className="advisor-foot">
          {mode === 'recommend' && question && (
            <div className="advisor-quiz">
              <p className="advisor-quiz-prompt">{question.prompt}</p>
              <div className="advisor-quiz-options">
                {question.options.map((option) => {
                  const selected = question.multi
                    ? answers.features.includes(option.value)
                    : answerFor(question.id) === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      className={`advisor-chip ${selected ? 'selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => chooseOption(question.id, option.value, question.multi)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="advisor-btn advisor-btn-primary"
                disabled={!canAdvance}
                onClick={advanceRecommendation}
              >
                {step === recommendationQuestions.length - 1 ? 'Show my recommendation' : 'Next'}
              </button>
            </div>
          )}

          {mode === 'custom' && (
            <div className="advisor-compose">
              {remaining > 0 && !aiDown ? (
                <>
                  <label className="sr-only" htmlFor="advisor-input">Your question</label>
                  <textarea
                    id="advisor-input"
                    ref={inputRef}
                    value={draft}
                    rows={2}
                    maxLength={LIMITS.maxQuestionLength}
                    placeholder="Ask about your website project…"
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void askCustom(); }
                    }}
                  />
                  <div className="advisor-compose-row">
                    <span className="advisor-remaining">
                      {remaining} custom question{remaining === 1 ? '' : 's'} remaining
                      {cooldown > 0 && ` · wait ${cooldown}s`}
                    </span>
                    <button
                      type="button"
                      className="advisor-btn advisor-btn-primary"
                      disabled={!draft.trim() || busy || cooldown > 0}
                      onClick={() => void askCustom()}
                    >
                      Ask
                    </button>
                  </div>
                </>
              ) : (
                <div className="advisor-limit">
                  <p>
                    {aiDown
                      ? 'Custom guidance is temporarily unavailable. Everything else in the Advisor still works.'
                      : 'You have used your available custom questions. You can still use the guided recommendation and all common questions, or discuss your project directly.'}
                  </p>
                  <div className="advisor-limit-actions">
                    <button type="button" className="advisor-chip" onClick={() => setMode('menu')}>
                      Browse common questions
                    </button>
                    {config.whatsappNumber && (
                      <a
                        className="advisor-chip advisor-chip-wa"
                        href={waHref('Hello, I would like to discuss a website for my business.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('whatsapp_clicked', { placement: 'advisor_limit' })}
                      >
                        Discuss on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'menu' && (
            <div className="advisor-actions">
              {quickActions.map((action) => (
                <button
                  type="button"
                  key={action.id}
                  className="advisor-chip"
                  onClick={() => runQuickAction(action)}
                >
                  <Icon name={action.icon} size={14} />
                  {action.label}
                </button>
              ))}
              <details className="advisor-all-faq">
                <summary>All common questions ({faqs.length})</summary>
                {faqCategories.map((category) => (
                  <div className="advisor-faq-group" key={category}>
                    <p>{category}</p>
                    {faqs.filter((item) => item.category === category).map((item) => (
                      <button type="button" key={item.id} className="advisor-faq-link" onClick={() => answerFaq(item)}>
                        {item.question}
                      </button>
                    ))}
                  </div>
                ))}
              </details>
              <p className="advisor-disclaimer">
                {portfolioInfo.publicPortfolioStatus === 'under_development'
                  ? 'Guidance only — pricing and timelines are confirmed after a scope discussion.'
                  : businessRules.identity.subtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
