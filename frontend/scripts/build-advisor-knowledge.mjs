// Generates api/_lib/knowledge.generated.ts from the JSON knowledge files.
//
// Why this exists: the serverless function previously imported the JSON
// directly from ../../src/data. Vercel builds the api directory with its own
// bundler, and imports that reach outside that directory are not reliably
// followed — the deployed function crashed on every request because the data
// was not there at runtime.
//
// src/data/*.json stays the single source of truth; this copies it into a
// plain TypeScript module beside the function, so the function imports only
// from its own directory. The output is committed, so a deploy still works
// even if this script never runs.
//
// Run automatically by `npm run build` (see the prebuild script).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const FILES = {
  faqs: 'faq.json',
  technologies: 'technologies.json',
  websiteTypes: 'website-types.json',
  services: 'services.json',
  portfolio: 'portfolio.json',
  businessRules: 'business-rules.json',
};

const parts = [
  '// GENERATED FILE — do not edit.',
  '// Source: src/data/*.json. Regenerate with `npm run build`',
  '// (or `node scripts/build-advisor-knowledge.mjs`).',
  '//',
  '// This exists so the serverless function imports only from its own',
  '// directory; see scripts/build-advisor-knowledge.mjs for why.',
  '',
];

for (const [name, file] of Object.entries(FILES)) {
  const raw = readFileSync(join(root, 'src', 'data', file), 'utf8');
  // Parsed and re-serialised so a malformed file fails here, loudly, at build
  // time rather than silently at runtime in production.
  const data = JSON.parse(raw);
  parts.push(`export const ${name} = ${JSON.stringify(data, null, 2)} as const;`);
  parts.push('');
}

const outDir = join(root, 'api', '_lib');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'knowledge.generated.ts'), parts.join('\n'), 'utf8');

const counts = Object.entries(FILES)
  .map(([name, file]) => {
    const data = JSON.parse(readFileSync(join(root, 'src', 'data', file), 'utf8'));
    return `${name}=${Array.isArray(data) ? data.length : 'object'}`;
  })
  .join(' ');
console.log(`advisor knowledge generated: ${counts}`);
