import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../analytics';
import { dismissNudge, nudgeDismissed } from '../../lib/advisor/session';
import Icon from '../Icon';

// The panel holds the whole knowledge base and conversation engine. Loading it
// only when the launcher is first pressed keeps it out of the initial bundle,
// so a visitor who never opens the Advisor pays nothing for it.
const AdvisorPanel = lazy(() => import('./AdvisorPanel'));

export default function WebsiteAdvisor() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [nudge, setNudge] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const openAdvisor = useCallback((placement: string) => {
    setLoaded(true);
    setOpen(true);
    setNudge(false);
    dismissNudge();
    trackEvent('advisor_opened', { placement });
  }, []);

  const closeAdvisor = useCallback(() => {
    setOpen(false);
    trackEvent('advisor_closed');
    launcherRef.current?.focus();
  }, []);

  // A single, dismissible suggestion after the visitor has read a little —
  // never on load, and never twice in a session.
  useEffect(() => {
    if (nudgeDismissed()) return;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 1.2) {
        setNudge(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {nudge && !open && (
        <div className="advisor-nudge" role="status">
          <p>Not sure what website your business needs?</p>
          <div className="advisor-nudge-actions">
            <button type="button" className="advisor-nudge-cta" onClick={() => openAdvisor('nudge')}>
              Ask Website Advisor
            </button>
            <button
              type="button"
              className="advisor-nudge-dismiss"
              onClick={() => { setNudge(false); dismissNudge(); }}
              aria-label="Dismiss suggestion"
            >
              <Icon name="close" size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        className={`advisor-launcher ${open ? 'is-open' : ''}`}
        onClick={() => (open ? closeAdvisor() : openAdvisor('launcher'))}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? 'Close Website Advisor' : 'Open Website Advisor'}
      >
        <Icon name={open ? 'close' : 'compass'} size={21} />
        <span className="advisor-launcher-label">Website Advisor</span>
      </button>

      {loaded && (
        <Suspense fallback={null}>
          <AdvisorPanel open={open} onClose={closeAdvisor} />
        </Suspense>
      )}
    </>
  );
}
