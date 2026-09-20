// Writes dist/index-webservices.html: the HTML shell served on
// webservices.manojrashinkar.com.
//
// WHY THIS EXISTS
// The site is one Vite build serving two hostnames, so both were getting the
// same index.html — the offer page's. Its title, its description, its
// canonical, its og:url, its og:image, all naming the other domain.
//
// The correct tags are applied at runtime by useDocumentMeta, which is fine
// for Google because Google renders JavaScript. It is not fine for anything
// else. WhatsApp, LinkedIn, Facebook and Slack read the raw HTML and stop, so
// every Web Services link shared anywhere was previewing as the offer page.
//
// The canonical was the sharper problem. Raw HTML saying "the real version of
// this page lives on website-offer.manojrashinkar.com" is an instruction to
// credit that domain and leave this one out of the index — which is the exact
// opposite of what this subdomain is for.
//
// Generated from the built file rather than maintained separately, so the
// asset hashes always match and the two shells cannot drift apart.
//
// Runs as postbuild; vercel.json routes the subdomain here.

import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'dist/index.html';
const TARGET = 'dist/index-webservices.html';
const ORIGIN = 'https://webservices.manojrashinkar.com';

// Kept in step with pages.home in src/content/communityContent.ts. Repeated
// rather than imported because this runs on the built output, after the
// bundler has finished and the source modules are no longer in play.
const TITLE = 'Digital Presence for Business | Web Services';
const DESCRIPTION =
  'Websites, web applications, and the WhatsApp, Facebook, Instagram and Google presence '
  + 'around them — built and connected as one. You deal directly with the developer, and every '
  + 'account ends up in your name.';
const SITE_NAME = 'Web Services — Manoj Rashinkar Venture';

let html = readFileSync(SOURCE, 'utf8');
const changes = [];

const swap = (label, pattern, replacement) => {
  const before = html;
  html = html.replace(pattern, replacement);
  changes.push(`${html === before ? 'MISS' : 'ok  '} ${label}`);
};

swap('title', /<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`);

swap('description', /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
  (_m, a, b) => `${a}${DESCRIPTION}${b}`);

// Removed rather than rewritten. One shell serves all six pages, so any fixed
// canonical would be wrong on five of them — and a canonical pointing every
// page at the home page collapses them into one. With none present a page is
// its own canonical, which is correct, and useDocumentMeta still sets the
// precise one at runtime for anything that renders.
swap('canonical (removed — see the note in this file)',
  /\s*<link rel="canonical"[^>]*>/, '');

swap('og:title', /(<meta property="og:title" content=")[^"]*(")/,
  (_m, a, b) => `${a}${SITE_NAME}${b}`);
swap('og:description', /(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/,
  (_m, a, b) => `${a}${DESCRIPTION}${b}`);
swap('og:site_name', /(<meta property="og:site_name" content=")[^"]*(")/,
  (_m, a, b) => `${a}${SITE_NAME}${b}`);
swap('og:image', /(<meta property="og:image" content=")[^"]*(")/,
  (_m, a, b) => `${a}${ORIGIN}/og-image.png${b}`);

// Same reasoning as the canonical: one shell, six pages. A fixed og:url would
// be wrong on five of them, and a scraper shows the link it followed anyway.
swap('og:url (removed)', /\s*<meta property="og:url"[^>]*>/, '');

swap('twitter:title', /(<meta name="twitter:title" content=")[^"]*(")/,
  (_m, a, b) => `${a}${SITE_NAME}${b}`);
swap('twitter:description', /(<meta\s+name="twitter:description"\s+content=")[\s\S]*?(")/,
  (_m, a, b) => `${a}${DESCRIPTION}${b}`);
swap('twitter:image', /(<meta name="twitter:image" content=")[^"]*(")/,
  (_m, a, b) => `${a}${ORIGIN}/og-image.png${b}`);

// The structured data describes the offer business at the other domain.
// Replaced with this branch, at this origin.
swap('structured data', /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    description: DESCRIPTION,
    url: `${ORIGIN}/`,
    image: `${ORIGIN}/og-image.png`,
    serviceType: 'Website design, web application development and deployment',
    areaServed: [
      { '@type': 'City', name: 'Navi Mumbai' },
      { '@type': 'City', name: 'Nashik' },
      { '@type': 'City', name: 'Shrirampur' },
      { '@type': 'City', name: 'Ahilyanagar' },
      { '@type': 'AdministrativeArea', name: 'Maharashtra, India' },
    ],
  })}</script>`);

writeFileSync(TARGET, html);

const missed = changes.filter((line) => line.startsWith('MISS'));
console.log(`subdomain shell written: ${TARGET}`);
changes.forEach((line) => console.log(`  ${line}`));

// A silent miss means index.html changed shape and this file is now lying
// about a tag it did not replace, which is worse than not running at all.
if (missed.length) {
  console.error(`\n  ${missed.length} tag(s) not found in ${SOURCE} — index.html has changed shape.`);
  process.exit(1);
}
