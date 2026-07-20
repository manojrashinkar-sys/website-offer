// Provider-agnostic analytics. Events are pushed to window.dataLayer (GTM style)
// and to an optional window.__promoAnalytics callback the portal can register.
// Never pass personal form values (names, phones, emails) as event properties.

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    __promoAnalytics?: (event: string, props?: EventProps) => void;
  }
}

export function trackEvent(event: string, props: EventProps = {}) {
  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...props });
    }
    if (typeof window.__promoAnalytics === 'function') {
      window.__promoAnalytics(event, props);
    }
    if (import.meta.env.DEV) {
      console.debug('[analytics]', event, props);
    }
  } catch {
    // Analytics must never break the page.
  }
}
