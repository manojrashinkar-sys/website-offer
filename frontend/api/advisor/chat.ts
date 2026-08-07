import { geminiProvider } from '../_lib/gemini';
import { buildContext, systemInstruction } from '../_lib/retrieval';
import {
  clientKey, looksLikeInjection, rateLimit, sanitiseAnswer, validateQuestion,
} from '../_lib/guard';
import { businessRules as rules } from '../_lib/knowledge.generated';

// Minimal request/response shapes. Typed locally rather than pulling in
// @vercel/node purely for two interfaces.
interface Req {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

export default async function handler(req: Req, res: Res) {
  try {
    await route(req, res);
  } catch {
    // Anything unhandled becomes the same graceful unavailable response the
    // assistant already knows how to recover from. A raw platform error page
    // is never something a visitor should meet.
    res.status(503).json({ error: 'unavailable' });
  }
}

async function route(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as
    | { question?: unknown }
    | null;

  const validation = validateQuestion(body?.question);
  if (!validation.ok) {
    res.status(400).json({ error: 'invalid_request', message: validation.error });
    return;
  }

  const limit = rateLimit(clientKey(req.headers));
  if (!limit.ok) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    res.status(429).json({ error: 'rate_limited', retryAfter: limit.retryAfter });
    return;
  }

  // Handled here rather than sent onward: there is no benefit to spending a
  // model call on a request whose only purpose is to break the rules.
  if (looksLikeInjection(validation.question)) {
    res.status(200).json({
      // The generated module is typed loosely, so this is narrowed at the
      // point of use rather than trusted.
      answer:
        (rules as { refusals?: { systemPrompt?: string } })?.refusals?.systemPrompt
        ?? 'I can only help with website and web development questions.',
      source: 'guard',
    });
    return;
  }

  if (!geminiProvider.isConfigured()) {
    res.status(503).json({ error: 'unavailable' });
    return;
  }

  const result = await geminiProvider.generate({
    question: validation.question,
    context: buildContext(validation.question),
    systemInstruction: systemInstruction(),
  });

  if (!result.ok || !result.answer) {
    // Deliberately generic: the visitor gets a useful fallback, and the reason
    // for the failure is never exposed.
    res.status(503).json({ error: 'unavailable' });
    return;
  }

  res.status(200).json({ answer: sanitiseAnswer(result.answer), source: 'ai' });
}

function safeParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
