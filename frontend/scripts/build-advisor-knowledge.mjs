// Injects the knowledge from src/data/*.json into the serverless function.
//
// Why injection rather than an import: Vercel does not include underscore-
// prefixed directories in a function bundle, and imports reaching outside the
// api directory are not reliably followed either. A diagnostic route proved
// it — a handler with no imports returned 200, and the identical handler
// failed the moment it imported anything from _lib, large module or small.
// The function therefore has to be a single self-contained file, so the data
// is written into it.
//
// The payload is emitted as a plain object literal. JSON is already valid
// TypeScript syntax, so nothing needs escaping — which removes the whole class
// of quoting bugs that a string-embedded version invites. It is deliberately
// not `as const`: on a literal this size that makes the compiler do an
// enormous amount of work for literal types nothing here uses.
//
// src/data/*.json remains the single source of truth. Nothing between the
// markers in chat.ts should ever be edited by hand.
//
// Runs automatically via the prebuild script.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const target = join(root, 'api', 'advisor', 'chat.ts');

const FILES = {
  faqs: 'faq.json',
  technologies: 'technologies.json',
  websiteTypes: 'website-types.json',
  services: 'services.json',
  portfolio: 'portfolio.json',
  businessRules: 'business-rules.json',
};

const knowledge = {};
for (const [key, file] of Object.entries(FILES)) {
  // Parsed so a malformed file fails here, loudly, at build time rather than
  // silently at runtime in production.
  knowledge[key] = JSON.parse(readFileSync(join(root, 'src', 'data', file), 'utf8'));
}

// Unlisted entries never reach the model.
//
// The browser can keep them and simply not display them, because it only ever
// returns an entry that a question matched. The model is different: give it a
// fact and it may volunteer that fact wherever it seems relevant, which is
// exactly what "answerable but never offered" rules out. Withholding it is the
// only way to be sure.
//
// Nothing is lost. These entries are answered by the local matcher before the
// model is ever consulted, so a direct question still gets a direct answer.
const unlisted = knowledge.faqs.filter((item) => item.unlisted);
knowledge.faqs = knowledge.faqs.filter((item) => !item.unlisted);

const START = '/* KNOWLEDGE_START */';
const END = '/* KNOWLEDGE_END */';

const source = readFileSync(target, 'utf8');
const from = source.indexOf(START);
const to = source.indexOf(END);
if (from === -1 || to === -1) {
  throw new Error(`Knowledge markers not found in ${target}. Restore ${START} and ${END}.`);
}

const literal = JSON.stringify(knowledge, null, 2);
const next =
  source.slice(0, from + START.length) +
  `\nconst K: Knowledge = ${literal};\n` +
  source.slice(to);

writeFileSync(target, next, 'utf8');

const summary = Object.entries(knowledge)
  .map(([key, value]) => `${key}=${Array.isArray(value) ? value.length : 'object'}`)
  .join(' ');
console.log(`advisor knowledge injected (${(literal.length / 1024).toFixed(1)}KB): ${summary}`);
if (unlisted.length) {
  console.log(`  withheld from the model: ${unlisted.map((item) => item.id).join(', ')}`);
}
