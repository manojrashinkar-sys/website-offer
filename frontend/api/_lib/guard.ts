// Request validation, abuse protection and prompt-injection defence.
// Everything here runs server-side only.

export const MAX_QUESTION_LENGTH = 400;
export const MAX_BODY_BYTES = 4000;
export const WINDOW_MS = 60_000;
export const MAX_PER_WINDOW = 8;

/**
 * In-memory rate limit, keyed by client IP.
 *
 * Serverless instances are not shared, so this is a speed bump rather than a
 * hard guarantee — a determined caller hitting many cold instances gets more
 * than MAX_PER_WINDOW. It exists to stop casual abuse and runaway loops
 * cheaply. A durable store would be the upgrade if that ever matters, but it
 * would mean adding infrastructure this project deliberately avoids.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound on a warm instance.
  if (hits.size > 500) {
    hits.forEach((times, mapKey) => {
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(mapKey);
    });
  }
  return { ok: true, retryAfter: 0 };
}

/** Phrases whose only purpose is to override the Advisor's instructions. */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+)?(previous|prior|your)\s+(instructions?|rules?)/i,
  /forget\s+(everything|all|your)\s+(instructions?|rules?|above)/i,
  /(show|reveal|print|repeat|output|tell)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?|rules?|configuration)/i,
  /\b(api[_\s-]?key|secret[_\s-]?key|environment\s+variable|env\s+var)\b/i,
  /you\s+are\s+now\s+(a|an|no longer)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(an?\s+)?(unrestricted|jailbroken|developer\s+mode)/i,
  /\bDAN\s+mode\b/i,
];

export function looksLikeInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export interface ValidationResult {
  ok: boolean;
  question: string;
  error?: string;
}

export function validateQuestion(raw: unknown): ValidationResult {
  if (typeof raw !== 'string') {
    return { ok: false, question: '', error: 'A question is required.' };
  }
  const question = raw.trim().replace(/\s+/g, ' ');
  if (question.length < 3) {
    return { ok: false, question: '', error: 'Please type a longer question.' };
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return { ok: false, question: '', error: `Please keep your question under ${MAX_QUESTION_LENGTH} characters.` };
  }
  return { ok: true, question };
}

/**
 * Strips anything the model should never emit, as a last line of defence in
 * case an instruction is ever coaxed out of it.
 */
export function sanitiseAnswer(text: string): string {
  return text
    .replace(/\bAIza[0-9A-Za-z_-]{10,}\b/g, '[removed]')
    .replace(/\bsk-[0-9A-Za-z_-]{10,}\b/g, '[removed]')
    .replace(/GEMINI_API_KEY\s*[=:]\s*\S+/gi, '[removed]')
    .replace(/<\/?script[^>]*>/gi, '')
    .trim();
}

export function clientKey(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (value ?? 'unknown').split(',')[0].trim();
}
