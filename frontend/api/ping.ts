// Diagnostic endpoint. No imports, no knowledge, no environment variables —
// if this responds and the advisor route does not, the problem is inside the
// advisor function rather than in the Vercel setup.
export default function handler(_req: unknown, res: {
  status(code: number): { json(body: unknown): void };
}) {
  res.status(200).json({ ok: true, runtime: 'reachable' });
}
