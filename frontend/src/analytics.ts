// Provider-agnostic analytics. Events are pushed to window.dataLayer (GTM style)
// and to an optional window.__promoAnalytics callback the portal can register.
// Never pass personal form values (names, phones, emails) as event properties.
//
// No tracking IDs are hardcoded here. To connect Google Analytics, Meta Pixel
// or Microsoft Clarity later, load that vendor's snippet and either let it read
// window.dataLayer or register window.__promoAnalytics — no change to call
// sites is needed.

import { getAttribution } from './utils/attribution';

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    __promoAnalytics?: (event: string, props?: EventProps) => void;
  }
}

/**
 * The conversion events this site reports. Kept as a named map so call sites
 * cannot drift apart on spelling, and so the full list is discoverable in
 * one place when wiring up a analytics provider.
 */
export const AnalyticsEvent = {
  pageView: 'promo_page_view',
  roadmapPageView: 'roadmap_page_view',
  heroConsultationClick: 'hero_consultation_click',
  whatsappClick: 'promo_whatsapp_click',
  phoneClick: 'phone_click',
  portfolioProjectClick: 'portfolio_project_click',
  businessTypeSelected: 'business_type_selected',
  formStarted: 'form_started',
  formSubmitted: 'promo_enquiry_submitted',
  roadmapCtaClick: 'roadmap_cta_click',
  applyClick: 'promo_apply_click',
} as const;

export function trackEvent(event: string, props: EventProps = {}) {
  try {
    // Campaign context travels with every event, so conversions can be
    // attributed without each call site remembering to pass it.
    const attribution = getAttribution();
    const payload: EventProps = { ...props };
    Object.entries(attribution).forEach(([key, value]) => {
      if (typeof value === 'string') payload[key] = value;
    });

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
    }
    if (typeof window.__promoAnalytics === 'function') {
      window.__promoAnalytics(event, payload);
    }
    if (import.meta.env.DEV) {
      console.debug('[analytics]', event, payload);
    }
  } catch {
    // Analytics must never break the page.
  }
}
