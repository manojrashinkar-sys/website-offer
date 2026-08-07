import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../analytics';
import { dismissNudge, nudgeDismissed } from '../../lib/advisor/session';
import Icon from '../Icon';
import AssistantMark from './AssistantMark';

// The panel holds the whole knowledge base and conversation engine. Loading it
// only when first needed keeps it out of the initial bundle, so a visitor who
// never opens it pays nothing for it.
const AdvisorPanel = lazy(() => import('./AdvisorPanel'));

/** Three seconds: long enough that the page has settled and been looked at,
 *  short enough to still read as an offer of help rather than an interruption. */
const GREETING_DELAY_MS = 3000;

export default function WebsiteAdvisor() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const openAdvisor = useCallback((placement: string) => {
    setLoaded(true);
    setOpen(true);
    setGreeting(false);
    dismissNudge();
    trackEvent('advisor_opened', { placement });
  }, []);

  const closeAdvisor = useCallback(() => {
    setOpen(false);
    trackEvent('advisor_closed');
    launcherRef.current?.focus();
  }, []);

  // Appears once, on a timer, and never again in the session once dismissed.
  // The panel itself is never opened automatically — arriving to find a dialog
  // already covering the page is the fastest way to get one closed unread.
  useEffect(() => {
    if (nudgeDismissed()) return;
    const timer = window.setTimeout(() => {
      setGreeting(true);
      // Warm the chunk while the greeting is on screen, so opening it is instant.
      setLoaded(true);
      trackEvent('advisor_greeting_shown');
    }, GREETING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissGreeting = () => {
    setGreeting(false);
    dismissNudge();
    trackEvent('advisor_greeting_dismissed');
  };

  return (
    <>
      {greeting && !open && (
        <div className="advisor-greeting" role="status">
          <button
            type="button"
            className="advisor-greeting-body"
            onClick={() => openAdvisor('greeting')}
          >
            <span className="advisor-greeting-title">Hi, how can I help you?</span>
            <span className="advisor-greeting-text">
              Tell me about your business and I&rsquo;ll suggest the right website for it — free, and in about a minute.
            </span>
          </button>
          <button
            type="button"
            className="advisor-greeting-dismiss"
            onClick={dismissGreeting}
            aria-label="Dismiss"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        className={`advisor-launcher ${open ? 'is-open' : ''} ${greeting && !open ? 'is-calling' : ''}`}
        onClick={() => (open ? closeAdvisor() : openAdvisor('launcher'))}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? 'Close Website Assistant AI' : 'Open Website Assistant AI'}
      >
        {open ? <Icon name="close" size={20} /> : <AssistantMark size={21} />}
        <span className="advisor-launcher-label">Website Assistant AI</span>
      </button>

      {loaded && (
        <Suspense fallback={null}>
          <AdvisorPanel open={open} onClose={closeAdvisor} />
        </Suspense>
      )}
    </>
  );
}
