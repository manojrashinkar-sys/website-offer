// Requirement estimator content and scoring. This recommends a project
// category and approach — it deliberately produces no price, because a real
// figure depends on scope that only a conversation can settle.

export interface Choice {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
  /** Contribution to the complexity score. */
  weight?: number;
  /**
   * True only for things that genuinely cannot work without a server and a
   * database. Page count, a blog or a product gallery are content work, not
   * infrastructure — treating them as such would recommend a backend to
   * businesses that plainly do not need one.
   */
  backend?: boolean;
}

export const purposes: Choice[] = [
  { id: 'present', label: 'Present my business professionally', icon: 'briefcase', weight: 0 },
  { id: 'enquiries', label: 'Generate more enquiries', icon: 'trending-up', weight: 1 },
  { id: 'products', label: 'Showcase products or a catalogue', icon: 'store', weight: 2 },
  { id: 'portfolio', label: 'Show my work or portfolio', icon: 'image', weight: 1 },
  { id: 'platform', label: 'Run a platform customers log in to', icon: 'layers', weight: 6, backend: true },
];

export const pageCounts: Choice[] = [
  { id: '1-3', label: '1 – 3 pages', hint: 'A focused single-purpose site', weight: 0 },
  { id: '4-6', label: '4 – 6 pages', hint: 'The usual business profile', weight: 1 },
  { id: '7-12', label: '7 – 12 pages', hint: 'Detailed services or products', weight: 3 },
  { id: '12+', label: 'More than 12 pages', hint: 'Large catalogue or many sections', weight: 5 },
];

export const featureChoices: Choice[] = [
  { id: 'whatsapp', label: 'WhatsApp button', icon: 'chat', weight: 0 },
  { id: 'form', label: 'Contact form', icon: 'edit', weight: 0 },
  { id: 'gallery', label: 'Product gallery', icon: 'image', weight: 1 },
  { id: 'portfolio', label: 'Portfolio section', icon: 'layers', weight: 1 },
  { id: 'maps', label: 'Google Maps', icon: 'map-pin', weight: 0 },
  { id: 'social', label: 'Social media links', icon: 'link', weight: 0 },
  { id: 'blog', label: 'Blog or news', icon: 'document', weight: 2 },
  { id: 'admin', label: 'Admin panel', icon: 'settings', weight: 6, backend: true },
  { id: 'payments', label: 'Payment integration', icon: 'credit-card', weight: 7, backend: true },
  { id: 'login', label: 'Customer login', icon: 'user', weight: 7, backend: true },
  { id: 'multilingual', label: 'Multiple languages', icon: 'globe', weight: 3 },
];

export const guidanceChoices: Choice[] = [
  { id: 'yes', label: 'Yes, I need guidance' },
  { id: 'have', label: 'I already have them' },
  { id: 'unsure', label: 'Not sure yet' },
];

export const timelines: Choice[] = [
  { id: '2w', label: 'Within 2 weeks' },
  { id: '2-4w', label: '2 – 4 weeks' },
  { id: '1-2m', label: '1 – 2 months' },
  { id: 'flexible', label: 'Flexible' },
];

export type Tier = 'Starter' | 'Business' | 'Advanced' | 'Custom';

export interface Recommendation {
  tier: Tier;
  category: string;
  approach: string;
  summary: string;
}

const RECOMMENDATIONS: Record<Tier, Omit<Recommendation, 'tier'>> = {
  Starter: {
    category: 'Business Profile Website',
    approach: 'Next.js site deployed to managed hosting, connected to your own domain.',
    summary:
      'A focused informational website. No backend, no database and no server administration — quick to build and simple to keep running.',
  },
  Business: {
    category: 'Professional Business Website',
    approach: 'Next.js site with structured content, richer sections and enquiry handling.',
    summary:
      'A larger website with more pages, product or service detail and stronger SEO structure. Still managed hosting, still low maintenance.',
  },
  Advanced: {
    category: 'Growing Business Platform',
    approach: 'Next.js frontend with a backend API, database and authentication.',
    summary:
      'Your website now stores and manages real data — accounts, records or content you control from an admin panel.',
  },
  Custom: {
    category: 'Custom Web Application',
    approach: 'Custom frontend and backend on infrastructure sized to the workload.',
    summary:
      'A system rather than a website, with its own infrastructure, security and scaling decisions confirmed against your exact requirements.',
  },
};

/**
 * Turns the selections into a recommended tier.
 *
 * A backend is recommended only when something genuinely requires one — an
 * admin panel, customer logins, payments, or a platform people sign in to.
 * Size and content volume alone move a project between Starter and Business
 * and never past it, so a large brochure site with a blog is never told it
 * needs a database and a server.
 */
export function recommend(score: number, needsBackend: boolean): Recommendation {
  let tier: Tier;
  if (needsBackend) {
    tier = score >= 16 ? 'Custom' : 'Advanced';
  } else {
    tier = score >= 4 ? 'Business' : 'Starter';
  }
  return { tier, ...RECOMMENDATIONS[tier] };
}
