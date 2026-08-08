// Link and URL helpers for the Web Services site.
//
// The same six pages are served by one Vercel project on two hostnames, and
// their paths differ between the two:
//
//   webservices.manojrashinkar.com/about   <- the real site
//   website-offer.manojrashinkar.com/community/about  <- preview / local dev
//
// Every internal link therefore has to be built for whichever host is
// actually serving, and every canonical URL has to point at the subdomain
// regardless of host, so search engines only ever see one copy.

import { config } from '../config';
import { pages, type PageKey } from '../content/communityContent';

/** True when the page is being served from the Web Services subdomain. */
export function onWebServicesHost(): boolean {
  return typeof window !== 'undefined'
    && window.location.hostname === config.webServicesHost;
}

/**
 * Path prefix for internal links. Empty on the subdomain, where the site owns
 * the root; '/community' anywhere else.
 */
export function communityBase(): string {
  return onWebServicesHost() ? '' : config.communityRoute;
}

/** Router path for a page, correct for whichever host is serving it. */
export function communityPath(key: PageKey): string {
  const { path } = pages[key];
  const base = communityBase();
  if (!path) return base || '/';
  return `${base}/${path}`;
}

/**
 * The one true address of a page — always on the subdomain, never on the host
 * that happens to be serving. This is what goes in <link rel="canonical">, so
 * the copies reachable at /community/* consolidate onto it instead of
 * competing with it.
 */
export function communityCanonical(key: PageKey): string {
  const { path } = pages[key];
  return `https://${config.webServicesHost}/${path}`;
}

/** The site root, for structured data and the logo link. */
export const communityOrigin = `https://${config.webServicesHost}`;
