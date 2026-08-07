// Diagnostic. Step 2: this now imports the same generated knowledge module the
// advisor uses. If ping keeps working, imports from _lib are fine and the fault
// is in the advisor's own logic. If ping starts failing, the bundler is not
// including _lib and that is the whole problem.
import { faqs } from './_lib/knowledge.generated';

export default function handler(_req: unknown, res: {
  status(code: number): { json(body: unknown): void };
}) {
  res.status(200).json({
    ok: true,
    faqCount: Array.isArray(faqs) ? faqs.length : 'NOT_AN_ARRAY',
  });
}
