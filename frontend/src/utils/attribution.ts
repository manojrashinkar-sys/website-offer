// Campaign attribution. UTM parameters usually arrive on the first page view
// and are gone by the time someone actually converts, so they are captured
// once and kept for the session.

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Attribution = Partial<Record<UtmKey, string>> & {
  landing_page?: string;
  referrer?: string;
};

const STORAGE_KEY = 'wo_attribution';

function readStored(): Attribution {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    // Private browsing and blocked storage must never break the page.
    return {};
  }
}

/**
 * Call once on start-up. Records UTM parameters, the landing page and the
 * external referrer the first time they are seen, and leaves them alone
 * afterwards so a later internal navigation cannot overwrite the campaign.
 */
export function captureAttribution(): Attribution {
  const stored = readStored();
  if (Object.keys(stored).length > 0) return stored;

  const params = new URLSearchParams(window.location.search);
  const captured: Attribution = {};

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) captured[key] = value.slice(0, 120);
  });

  captured.landing_page = window.location.pathname;
  if (document.referrer && !document.referrer.includes(window.location.host)) {
    captured.referrer = document.referrer.slice(0, 200);
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // Non-fatal: attribution is a nice-to-have, not a requirement.
  }
  return captured;
}

export function getAttribution(): Attribution {
  return readStored();
}

/** Flattens attribution into the lines appended to a WhatsApp enquiry. */
export function attributionSummary(): string {
  const data = getAttribution();
  const parts = UTM_KEYS.filter((key) => data[key]).map((key) => `${key}: ${data[key]}`);
  return parts.join('\n');
}
