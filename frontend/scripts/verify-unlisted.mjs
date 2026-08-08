// Proves the unlisted entry is reachable only by name, using the real engine
// rather than an approximation of its scoring.
import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'node_modules/.cache/unlisted.mjs';
await build({
  stdin: {
    contents: "export { bestFaqAnswer, faqs, listedFaqs, searchFaqs } from '../src/lib/advisor/engine';",
    resolveDir: 'scripts', sourcefile: 'e.ts', loader: 'ts',
  },
  bundle: true, format: 'esm', platform: 'node', outfile: OUT, logLevel: 'error',
});
const { bestFaqAnswer, faqs, listedFaqs, searchFaqs } = await import(pathToFileURL(OUT).href);

const TARGET = 'about-chandrakant';
let fail = 0;

console.log('\n  reachable when asked for by name');
for (const q of ['Who is Chandrakant Kale?', 'who is chandrakant', 'tell me about chandrakant kale',
                 'chandrakant kale', 'chandrakant', 'who is kale']) {
  const hit = bestFaqAnswer(q);
  const ok = hit?.id === TARGET;
  if (!ok) fail++;
  console.log(`    ${ok ? 'ok  ' : 'MISS'} ${q.padEnd(32)} -> ${hit ? hit.id : '(defers to AI)'}`);
}

console.log('\n  must never reach him');
for (const q of ['who is manoj', 'who are you', 'who is your team', 'tell me about your team',
                 'who is your friend', 'who handles clients', 'who will i deal with', 'front desk',
                 'who is the owner', 'tell me about yourself', 'who is mira', 'what is your role',
                 'who manages clients', 'is there anyone else']) {
  const hit = bestFaqAnswer(q);
  const leaked = hit?.id === TARGET;
  if (leaked) fail++;
  console.log(`    ${leaked ? 'LEAK' : 'ok  '} ${q.padEnd(32)} -> ${hit ? hit.id : '(defers to AI)'}`);
}

console.log('\n  never offered');
const suggested = searchFaqs('website cost domain hosting team business', 20).map((m) => m.item.id);
const checks = [
  ['absent from the browsable list', !listedFaqs.some((f) => f.id === TARGET)],
  ['absent from related-question chips', !suggested.includes(TARGET)],
  ['no other entry links to him', !faqs.some((f) => f.followUpQuestions?.includes(TARGET))],
  ['no other entry names him', !faqs.some((f) => f.id !== TARGET && /chandrakant/i.test(JSON.stringify(f)))],
];
for (const [label, ok] of checks) { if (!ok) fail++; console.log(`    ${ok ? 'ok  ' : 'FAIL'} ${label}`); }
console.log(`    browser shows ${listedFaqs.length} of ${faqs.length} questions`);

rmSync(OUT, { force: true });
console.log(`\n  ${fail ? fail + ' FAILURE(S)' : 'ALL PASS'}\n`);
process.exit(fail ? 1 : 0);
