import leadFlow from '../../data/lead-flow.json';

export const LIMITS = leadFlow.limits;
export const quickActions = leadFlow.quickActions;
export const contextualCtas = leadFlow.contextualCtas as Record<
  string,
  Array<{ label: string; kind: string; faqId?: string }>
>;

const KEY_COUNT = 'wo_advisor_ai_used';
const KEY_DISMISSED = 'wo_advisor_nudge_dismissed';

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked — limits still apply in memory for this page view, and
    // the server enforces its own limit regardless.
  }
}

export function customQuestionsUsed(): number {
  const raw = read(KEY_COUNT);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function customQuestionsRemaining(): number {
  return Math.max(0, LIMITS.customQuestionsPerSession - customQuestionsUsed());
}

export function recordCustomQuestion(): number {
  const next = customQuestionsUsed() + 1;
  write(KEY_COUNT, String(next));
  return Math.max(0, LIMITS.customQuestionsPerSession - next);
}

export function nudgeDismissed(): boolean {
  return read(KEY_DISMISSED) === '1';
}

export function dismissNudge() {
  write(KEY_DISMISSED, '1');
}
