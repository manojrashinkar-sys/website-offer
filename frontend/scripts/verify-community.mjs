// Renders each Web Services page to a string and checks what came out.
//
// The site is a client-rendered SPA, so `curl` only ever returns the empty
// index.html shell — it cannot tell a working page from a blank one. This
// bundles the real components and renders them, which can.
//
// Run with: node scripts/verify-community.mjs

import { build } from 'esbuild';
import { readFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'node_modules/.cache/community-verify.mjs';

const ENTRY = `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import CommunityLayout from '../src/community/CommunityLayout';
import Home from '../src/community/pages/HomePage';
import About from '../src/community/pages/AboutPage';
import Services from '../src/community/pages/ServicesPage';
import Work from '../src/community/pages/WorkPage';
import Process from '../src/community/pages/ProcessPage';
import Contact from '../src/community/pages/ContactPage';

const PAGES = { '': Home, about: About, services: Services, work: Work, process: Process, contact: Contact };

export function render(path) {
  return renderToStaticMarkup(
    React.createElement(StaticRouter, { location: path },
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/', element: React.createElement(CommunityLayout) },
          Object.entries(PAGES).map(([sub, Page]) =>
            React.createElement(Route, sub
              ? { key: sub, path: sub, element: React.createElement(Page) }
              : { key: 'index', index: true, element: React.createElement(Page) }),
          ),
        ),
      ),
    ),
  );
}
`;

await build({
  stdin: { contents: ENTRY, resolveDir: 'scripts', sourcefile: 'entry.tsx', loader: 'tsx' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: OUT,
  jsx: 'automatic',
  // react-dom/server is CommonJS and pulls in node builtins with require(),
  // which an ESM bundle has no definition for.
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
  loader: { '.css': 'empty', '.svg': 'empty', '.png': 'empty', '.jpg': 'empty', '.webp': 'empty' },
  define: { 'import.meta.env': JSON.stringify({ MODE: 'production', PROD: true, DEV: false }) },
  logLevel: 'error',
});

// Minimal browser globals. The app is client-only and never runs in Node, so
// this exists purely so the components can be rendered for inspection.
// The hostname is deliberately the *main* domain: that is the case where links
// must be prefixed with /community, which is the one worth checking.
const noop = () => {};
const mediaQuery = () => ({
  matches: false, addEventListener: noop, removeEventListener: noop,
  addListener: noop, removeListener: noop,
});
const element = () => ({
  setAttribute: noop, getAttribute: () => null, removeAttribute: noop,
  remove: noop, appendChild: noop, style: {}, dataset: {},
  classList: { add: noop, remove: noop, contains: () => false },
  querySelectorAll: () => [], focus: noop,
});

globalThis.window = {
  location: { hostname: 'website-offer.manojrashinkar.com', pathname: '/', search: '', href: '/' },
  matchMedia: mediaQuery,
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  addEventListener: noop, removeEventListener: noop, scrollTo: noop, scrollY: 0,
  requestAnimationFrame: noop, setTimeout: noop, clearTimeout: noop,
};
globalThis.document = {
  documentElement: element(), head: { ...element(), querySelector: () => null },
  body: { ...element(), style: {} },
  createElement: element, getElementById: () => null,
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener: noop, removeEventListener: noop,
};
globalThis.localStorage = globalThis.window.localStorage;
globalThis.matchMedia = mediaQuery;
// Node 21+ defines navigator as a getter-only global, so leave it alone.

const { render } = await import(pathToFileURL(OUT).href);

const CHECKS = [
  { path: '/', name: 'Home', must: ['Websites and web applications', 'Four things that do not change', 'Yojit Enterprises', 'Awaiting client permission'] },
  { path: '/about', name: 'About', must: ['About Web Services', 'Why this branch exists', 'Ownership, not dependency', 'Who you will be dealing with'] },
  { path: '/services', name: 'Services', must: ['What we build', 'Business websites', 'Web applications', 'Who it suits', 'Worth knowing'] },
  { path: '/work', name: 'Work', must: ['Our work', 'Yojit Enterprises', 'manojrashinkar.com/yojit-enterprises', 'Awaiting client permission'] },
  { path: '/process', name: 'Process', must: ['How a project runs', 'Discovery', 'Launch and handover', 'What you provide', 'What you get'] },
  { path: '/contact', name: 'Contact', must: ['Start a conversation', 'What to expect', 'Reach us directly'] },
];

// Present on every page — the shell must survive each route.
const SHELL = ['Web Services', 'Manoj Rashinkar Venture', 'Site pages', 'All rights reserved'];

let failures = 0;
console.log('');

for (const { path, name, must } of CHECKS) {
  let html = '';
  try {
    html = render(path);
  } catch (error) {
    console.log(`  FAIL  ${name.padEnd(9)} threw: ${error.message}`);
    failures += 1;
    continue;
  }

  const missing = [...must, ...SHELL].filter((needle) => !html.includes(needle));
  const h1 = (html.match(/<h1[^>]*>([^<]+)/) || [])[1] || '(none)';
  const navLinks = (html.match(/class="nav-link[^"]*"/g) || []).length;

  if (missing.length === 0 && html.length > 4000) {
    console.log(`  ok    ${name.padEnd(9)} ${String(html.length).padStart(6)} chars  nav=${navLinks}  h1="${h1.slice(0, 46)}"`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name.padEnd(9)} ${String(html.length).padStart(6)} chars  missing: ${missing.join(', ') || '(too short)'}`);
  }
}

// Off-subdomain the links must be prefixed, or every nav item 404s in preview.
const home = render('/');
const prefixed = (home.match(/href="\/community\//g) || []).length;
console.log('');
console.log(`  links prefixed with /community when off-subdomain: ${prefixed} ${prefixed > 0 ? '(ok)' : '(FAIL)'}`);
if (prefixed === 0) failures += 1;

// The assistant is deliberately absent from first paint — it appears after 3s.
console.log(`  assistant absent from first paint: ${!home.includes('advisor-launcher') ? 'ok (by design)' : 'FAIL — it should be delayed'}`);
if (home.includes('advisor-launcher')) failures += 1;

rmSync(OUT, { force: true });
console.log('');
console.log(failures === 0 ? '  ALL PASS' : `  ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
