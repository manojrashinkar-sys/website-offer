import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../analytics';
import { config } from '../../config';
import { whatsappLink } from '../../utils/whatsapp';
import {
  bestFaqAnswer, faqCategories, faqs, getFaq, inferBrief, recommend, searchFaqs,
  type FaqItem, type Recommendation, type RecommendationAnswers,
} from '../../lib/advisor/engine';
import { buildSummary, summaryMessage, type LeadSummary } from '../../lib/advisor/leadSummary';
import { customQuestionsRemaining, LIMITS, recordCustomQuestion } from '../../lib/advisor/session';
import roadmap from '../../data/roadmap.json';
import technologies from '../../data/technologies.json';
import Icon from '../Icon';

type Block =
  | { kind: 'advisor'; text: string; id: string }
  | { kind: 'visitor'; text: string; id: string }
  | { kind: 'faq-list'; items: FaqItem[]; id: string }
  | { kind: 'recommendation'; value: Recommendation; answers: RecommendationAnswers; id: string }
  | { kind: 'summary'; value: LeadSummary; id: string };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type NewBlock = DistributiveOmit<Block, 'id'>;

let blockId = 0;
const nextId = () => `b${(blockId += 1)}`;

const OPENING =
  'Hello, I am MIRA — the website assistant here.\n\nTell me about your business in a sentence ' +
  'or two and I will suggest what kind of website would suit it, and how it would be built. ' +
  'Or ask me anything — cost, domains, hosting, how long it takes.';

// Quiet prompts, not a menu of buttons. Kept short so they read as examples of
// what you might type rather than a set of options you must choose between.
const SUGGESTIONS = [
  { label: 'What will it cost?', faqId: 'price-how' },
  { label: 'Who owns the domain?', faqId: 'domain-who-owns' },
  { label: 'How long does it take?', faqId: 'dev-how-long' },
  { label: 'Do I need a server?', faqId: 'server-need' },
  { label: 'Can it grow later?', faqId: 'scale-later' },
];

/**
 * Turns bare URLs in an answer into real links.
 *
 * Built as React elements rather than injected HTML: the text passing through
 * here includes model output, and dangerouslySetInnerHTML on model output is
 * how a prompt injection becomes a script tag. Only http and https are linked,
 * and a trailing full stop is left as punctuation rather than swallowed into
 * the href.
 */
const URL_PATTERN = /(https?:\/\/[^\s<>"')\]]+)/g;

function linkify(text: string): React.ReactNode[] {
  return text.split(URL_PATTERN).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const trailing = part.match(/[.,;:!?]+$/)?.[0] ?? '';
    const href = trailing ? part.slice(0, -trailing.length) : part;
    // A link back to this same site should not spawn a tab — that is
    // navigation, not leaving. Anything external still opens separately.
    const sameSite = href.includes(window.location.host);
    return (
      <span key={index}>
        <a
          className="advisor-link"
          href={href}
          {...(sameSite ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {href.replace(/^https?:\/\//, '')}
        </a>
        {trailing}
      </span>
    );
  });
}

const FOLLOW_UP: Record<string, string> = {
  businessType: 'What kind of business is it? Even one word helps — a shop, a clinic, a manufacturer.',
  goal: 'And what should the website mainly do for you — present the business, bring in enquiries, or show products?',
};

export default function AdvisorPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [blocks, setBlocks] = useState<Block[]>([{ kind: 'advisor', text: OPENING, id: nextId() }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(customQuestionsRemaining());
  const [cooldown, setCooldown] = useState(0);
  const [brief, setBrief] = useState<RecommendationAnswers>({ features: [] });
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  // Prompts collapse away on request. On a phone they occupy a third of the
  // sheet, which is space you want back once you are reading an answer.
  const [showPrompts, setShowPrompts] = useState(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const push = useCallback((block: NewBlock) => {
    setBlocks((current) => [...current, { ...block, id: nextId() } as Block]);
  }, []);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [blocks, busy]);

  // Once there is something to read, the prompts fold themselves away rather
  // than waiting to be dismissed. They are an opener, not a permanent menu.
  useEffect(() => {
    if (blocks.length > 2) setShowPrompts(false);
  }, [blocks.length]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

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

  /**
   * Keep the sheet inside the part of the screen you can actually see.
   *
   * The panel is sized in vh, and vh does not shrink when the on-screen
   * keyboard appears — the layout viewport stays the full height of the
   * device. So on a phone the sheet kept its full height, the keyboard
   * covered the bottom of it, and the whole thing rode up off the top of the
   * screen while you were typing.
   *
   * visualViewport is the only thing that reports the region left over, so
   * the height and the bottom offset are published as custom properties and
   * the stylesheet clamps against them. When there is no keyboard the visual
   * viewport is the full height, the clamp does nothing, and the panel keeps
   * its normal 86vh.
   */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || !vv) return;

    const root = document.documentElement;
    const apply = () => {
      // offsetTop is non-zero when the page itself has been scrolled up to
      // reveal a focused field; without it the sheet sits below the keyboard.
      const bottomInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--advisor-vp-h', `${Math.round(vv.height)}px`);
      root.style.setProperty('--advisor-vp-bottom', `${Math.round(bottomInset)}px`);
    };

    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      root.style.removeProperty('--advisor-vp-h');
      root.style.removeProperty('--advisor-vp-bottom');
    };
  }, [open]);

  const clearChat = () => {
    setBlocks([{ kind: 'advisor', text: OPENING, id: nextId() }]);
    setBrief({ features: [] });
    setDraft('');
    setShowPrompts(true);
    setShowAllFaqs(false);
    trackEvent('advisor_cleared');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const answerFaq = (item: FaqItem, echo = true) => {
    if (echo) push({ kind: 'visitor', text: item.question });
    push({ kind: 'advisor', text: item.answer });
    const follows = item.followUpQuestions.map(getFaq).filter(Boolean) as FaqItem[];
    if (follows.length) push({ kind: 'faq-list', items: follows });
    trackEvent('faq_selected', { faq_id: item.id, category: item.category });
  };

  const giveRecommendation = (answers: RecommendationAnswers) => {
    const value = recommend(answers);
    push({ kind: 'recommendation', value, answers });
    trackEvent('recommendation_completed', {
      tier: value.tier, backend: value.backendRequired,
      business_type: answers.businessType ?? 'unspecified',
    });
  };

  const topicShortcut = (topic: 'process' | 'technology') => {
    if (topic === 'process') {
      push({ kind: 'visitor', text: 'How does the development process work?' });
      push({
        kind: 'advisor',
        text:
          `A project runs through ${roadmap.length} stages, from business discovery to future scaling. ` +
          'The early ones — discovery, requirements and content — decide most of the outcome; development, ' +
          'testing, domain setup and launch follow, then handover and optional support.\n\n' +
          'Every stage is broken down here, including what we do and what you provide:\n' +
          'https://website-offer.manojrashinkar.com/development-roadmap',
      });
    } else {
      const core = (technologies as Array<Record<string, unknown>>).filter((t) => !t.requiresPaidInfrastructure);
      push({ kind: 'visitor', text: 'Which technologies would my website use?' });
      push({
        kind: 'advisor',
        text:
          'Most business websites need only these:\n\n' +
          core.slice(0, 5).map((t) => `${t.name} — ${t.businessBenefit}`).join('\n') +
          '\n\nServers, databases and container tooling exist for projects that genuinely need them. ' +
          'We do not add paid infrastructure unless your project actually requires it.',
      });
    }
    trackEvent('advisor_quick_action', { action: topic });
  };

  /**
   * One input, three outcomes, tried in order of cost to the visitor:
   * a known answer, then a local recommendation from what they described,
   * and only then one of their five AI questions.
   */
  const send = async (raw?: string) => {
    const text = (raw ?? draft).trim();
    if (!text || busy || cooldown > 0) return;

    push({ kind: 'visitor', text });
    setDraft('');

    const known = bestFaqAnswer(text);
    if (known) { answerFaq(known, false); return; }

    const inferred = inferBrief(text);
    const merged: RecommendationAnswers = {
      businessType: inferred.answers.businessType ?? brief.businessType,
      goal: inferred.answers.goal ?? brief.goal,
      features: Array.from(new Set([...brief.features, ...inferred.answers.features])),
    };
    const enough = Boolean(
      (merged.businessType && merged.goal) ||
      merged.features.some((f) => ['login', 'payments', 'admin'].includes(f)) ||
      (merged.businessType && merged.features.length > 0),
    );

    if (inferred.answers.businessType || inferred.answers.goal || inferred.answers.features.length) {
      setBrief(merged);
      if (enough) { giveRecommendation(merged); return; }
      // Exactly one follow-up, in prose — never a list of options.
      push({ kind: 'advisor', text: FOLLOW_UP[!merged.businessType ? 'businessType' : 'goal'] });
      return;
    }

    if (remaining <= 0) {
      push({
        kind: 'advisor',
        text:
          'You have used your custom questions for this visit. I can still answer any of the common ' +
          'questions below, or you can carry on with us directly — that way you get a proper answer ' +
          'rather than a general one.',
      });
      const related = searchFaqs(text, 3).map((match) => match.item);
      if (related.length) push({ kind: 'faq-list', items: related });
      trackEvent('ai_limit_reached');
      return;
    }

    setBusy(true);
    trackEvent('custom_ai_question');
    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as { answer?: string };
      if (!data.answer) throw new Error('empty');
      push({ kind: 'advisor', text: data.answer });
      setRemaining(recordCustomQuestion());
    } catch {
      trackEvent('ai_error');
      push({
        kind: 'advisor',
        text:
          'I cannot reach my detailed guidance just now. These may cover it — or tell me about your ' +
          'business and I will suggest a setup without needing it.',
      });
      const related = searchFaqs(text, 3).map((match) => match.item);
      if (related.length) push({ kind: 'faq-list', items: related });
    } finally {
      setBusy(false);
      setCooldown(LIMITS.cooldownSeconds);
    }
  };

  return (
    <>
      {open && <div className="advisor-scrim" onClick={onClose} aria-hidden="true" />}
      <div
        className={`advisor-panel ${open ? 'open' : ''}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="MIRA, the website assistant"
        aria-hidden={!open}
      >
        <header className="advisor-head">
          <span className="advisor-head-text">
            <strong>MIRA</strong>
            <small>Website Assistant AI</small>
          </span>
          {blocks.length > 1 && (
            <button
              type="button"
              className="advisor-clear"
              onClick={clearChat}
              title="Start a new conversation"
            >
              <Icon name="refresh" size={14} />
              Clear
            </button>
          )}
          <button type="button" className="advisor-close" onClick={onClose} aria-label="Close MIRA">
            <Icon name="close" size={16} />
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
                  {block.text.split('\n\n').map((para, index) => <p key={index}>{linkify(para)}</p>)}
                </div>
              );
            }
            if (block.kind === 'faq-list') {
              return (
                <div className="advisor-related" key={block.id}>
                  {block.items.map((item) => (
                    <button type="button" key={item.id} className="advisor-related-link" onClick={() => answerFaq(item)}>
                      {item.question}
                    </button>
                  ))}
                </div>
              );
            }
            if (block.kind === 'recommendation') {
              const value = block.value;
              return (
                <div className="advisor-note" key={block.id}>
                  <p className="advisor-note-label">Suggested for you</p>
                  <h4>{value.websiteTypeName}</h4>
                  <p className="advisor-note-reason">{value.reason}</p>
                  <dl className="advisor-note-spec">
                    <div><dt>Architecture</dt><dd>{value.architecture}</dd></div>
                    <div><dt>Backend</dt><dd>{value.backendRequired ? 'Required' : 'Not required initially'}</dd></div>
                    <div><dt>Database</dt><dd>{value.databaseRequired ? 'Required' : 'Not required initially'}</dd></div>
                  </dl>
                  <button
                    type="button"
                    className="advisor-note-action"
                    onClick={() => {
                      const summary = buildSummary(block.answers, value);
                      push({ kind: 'summary', value: summary });
                      trackEvent('lead_summary_created', { tier: value.tier });
                    }}
                  >
                    Turn this into a summary I can send →
                  </button>
                </div>
              );
            }
            const summary = block.value;
            return (
              <div className="advisor-note" key={block.id}>
                <p className="advisor-note-label">Your requirement</p>
                <dl className="advisor-note-spec">
                  <div><dt>Business</dt><dd>{summary.businessType}</dd></div>
                  <div><dt>Main goal</dt><dd>{summary.goal}</dd></div>
                  <div><dt>Features</dt><dd>{summary.features.length ? summary.features.join(', ') : 'To be discussed'}</dd></div>
                  <div><dt>Suggested</dt><dd>{summary.recommendation.websiteTypeName}</dd></div>
                </dl>
                {config.whatsappNumber && (
                  <a
                    className="advisor-send-wa"
                    href={whatsappLink(summaryMessage(summary))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_clicked', { placement: 'advisor_summary' })}
                  >
                    <Icon name="chat" size={15} />
                    Send this to us
                  </a>
                )}
              </div>
            );
          })}

          {busy && (
            <p className="advisor-typing" role="status" aria-live="polite">
              <span /><span /><span /><span className="sr-only">Thinking</span>
            </p>
          )}
        </div>

        <div className="advisor-compose">
          {!showAllFaqs && !showPrompts && (
            <button
              type="button"
              className="advisor-prompts-toggle"
              onClick={() => setShowPrompts(true)}
              aria-expanded={false}
            >
              Show suggested questions
            </button>
          )}

          {!showAllFaqs && showPrompts ? (
            <div className="advisor-hints">
              <button
                type="button"
                className="advisor-hint advisor-hint-hide"
                onClick={() => setShowPrompts(false)}
                aria-label="Hide suggested questions"
              >
                Hide
              </button>
              {SUGGESTIONS.map((suggestion) => {
                const item = getFaq(suggestion.faqId);
                if (!item) return null;
                return (
                  <button type="button" key={suggestion.faqId} className="advisor-hint" onClick={() => answerFaq(item)}>
                    {suggestion.label}
                  </button>
                );
              })}
              <button type="button" className="advisor-hint" onClick={() => topicShortcut('process')}>The process</button>
              <button type="button" className="advisor-hint" onClick={() => setShowAllFaqs(true)}>
                All {faqs.length} questions
              </button>
            </div>
          ) : showAllFaqs ? (
            <div className="advisor-faq-browser">
              <button type="button" className="advisor-hint" onClick={() => setShowAllFaqs(false)}>← Back</button>
              {faqCategories.map((category) => (
                <div className="advisor-faq-group" key={category}>
                  <p>{category}</p>
                  {faqs.filter((item) => item.category === category).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="advisor-faq-link"
                      onClick={() => { setShowAllFaqs(false); answerFaq(item); }}
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          <div className="advisor-input-row">
            <label className="sr-only" htmlFor="advisor-input">Your message</label>
            <textarea
              id="advisor-input"
              ref={inputRef}
              value={draft}
              rows={1}
              maxLength={LIMITS.maxQuestionLength}
              placeholder="Chat with MIRA…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); }
              }}
            />
            <button
              type="button"
              className="advisor-send"
              disabled={!draft.trim() || busy || cooldown > 0}
              onClick={() => void send()}
              aria-label="Send"
            >
              <Icon name="arrow-right" size={17} />
            </button>
          </div>
          <p className="advisor-foot-note">
            {cooldown > 0
              ? `One moment — ${cooldown}s`
              : 'Guidance only, and this conversation is not saved — so nothing here reaches us. For a quotation or to start a project, message on WhatsApp or call.'}
          </p>
        </div>
      </div>
    </>
  );
}
