// Per-page SEO for the Web Services site.
//
// Three things have to be right on every page, and getting them right once
// here is safer than repeating them six times.

import { pages, venture, type PageKey } from '../content/communityContent';
import { useDocumentMeta, type StructuredData } from '../hooks/useDocumentMeta';
import { communityCanonical, communityOrigin, onWebServicesHost } from './routing';

/**
 * Published. Pages on the subdomain are indexable; the copies served under
 * /community on the main domain keep their noindex, so the two never compete
 * for the same terms.
 *
 * To unpublish: set this to false, put `Disallow: /` back in
 * public/robots-webservices.txt, and empty public/sitemap-webservices.xml.
 */
export const COMMUNITY_PUBLISHED = true;

/**
 * Whether this particular render should be indexable. Only the subdomain ever
 * is — the copies served under /community exist for previewing and local
 * development, and must never compete with the real pages.
 */
function robotsFor(): string | undefined {
  if (!COMMUNITY_PUBLISHED) return 'noindex, nofollow';
  return onWebServicesHost() ? undefined : 'noindex, nofollow';
}

export function useCommunityMeta(key: PageKey, structuredData: StructuredData[] = []) {
  const page = pages[key];
  const canonical = communityCanonical(key);
  const ogTitle = key === 'home' ? `${venture.branch} — ${venture.parent}` : page.title;

  const breadcrumb: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: venture.branch, item: `${communityOrigin}/` },
      ...(key === 'home'
        ? []
        : [{ '@type': 'ListItem', position: 2, name: page.nav, item: canonical }]),
    ],
  };

  useDocumentMeta({
    title: page.title,
    description: page.description,
    canonical,
    robots: robotsFor(),
    og: {
      'og:type': 'website',
      'og:site_name': `${venture.branch} — ${venture.parent}`,
      'og:title': ogTitle,
      'og:description': page.description,
      'og:url': canonical,
      // index.html points og:image at the offer domain. On this host that is
      // a cross-origin URL for the same file, and some scrapers will not
      // follow it — so it is restated here against this origin.
      'og:image': `${communityOrigin}/og-image.png`,
      'og:image:width': '1200',
      'og:image:height': '630',
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': ogTitle,
      'twitter:description': page.description,
      'twitter:image': `${communityOrigin}/og-image.png`,
    },
    structuredData: [...structuredData, breadcrumb],
  });
}
