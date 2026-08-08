// Copy for the Web Services community page.
//
// Honesty rules that apply to everything here: no invented clients, no project
// counts, no testimonials, no ratings, no guarantees. Only Yojit Enterprises
// has agreed to be shown publicly, so only Yojit Enterprises appears.

export const venture = {
  parent: 'Manoj Rashinkar Venture',
  branch: 'Web Services',
  tagline: 'Websites and web applications for growing businesses',
  intro:
    'Web Services is the web development branch of Manoj Rashinkar Venture. We plan, design, ' +
    'build and launch websites for businesses that need a credible presence online — and web ' +
    'applications for the ones that have outgrown a website.',
};

export interface Pillar {
  icon: string;
  title: string;
  body: string;
}

export const pillars: Pillar[] = [
  {
    icon: 'user',
    title: 'You work with the developer',
    body: 'No agency layer and no account manager. The person who discusses your project is the person who builds it.',
  },
  {
    icon: 'shield-check',
    title: 'Only what you actually need',
    body: 'We do not add a server, a database or a subscription unless your project genuinely requires one. Most business websites do not.',
  },
  {
    icon: 'key',
    title: 'You own everything',
    body: 'Your domain stays in your name, in your own account. Hosting can be yours too. Nothing is held hostage.',
  },
  {
    icon: 'clipboard-check',
    title: 'Written scope before work starts',
    body: 'What is included, what is not, and what is charged separately — agreed in writing so there are no surprises later.',
  },
];

export interface Capability {
  icon: string;
  title: string;
  summary: string;
  points: string[];
}

export const capabilities: Capability[] = [
  {
    icon: 'store',
    title: 'Business websites',
    summary: 'A clear, credible presence that turns searches into enquiries.',
    points: [
      'Company profile and service pages',
      'Product catalogues and galleries',
      'WhatsApp, call and enquiry forms',
      'Google Maps and social links',
      'Basic SEO and mobile-first build',
    ],
  },
  {
    icon: 'layers',
    title: 'Web applications',
    summary: 'When a website alone cannot run the part of the business you need it to.',
    points: [
      'Customer accounts and logins',
      'Admin panels and content control',
      'Databases and reporting',
      'Payment integration',
      'APIs and third-party systems',
    ],
  },
  {
    icon: 'refresh',
    title: 'Redesign and rescue',
    summary: 'For sites that are dated, slow, unusable on phones, or that nobody can update.',
    points: [
      'Rebuild on a modern, maintainable stack',
      'Keep the domain and the search history',
      'Content migrated, not retyped',
      'Performance and mobile fixed properly',
    ],
  },
  {
    icon: 'cloud',
    title: 'Domain, hosting and launch',
    summary: 'The part most businesses find opaque, handled and explained.',
    points: [
      'Choosing and registering a domain in your name',
      'DNS configured without handing over passwords',
      'SSL, deployment and go-live',
      'Technical handover you can actually use',
    ],
  },
];

export interface WorkItem {
  name: string;
  sector: string;
  type: string;
  url: string;
  highlights: string[];
}

/** Only clients who have agreed in writing to be shown publicly. */
export const work: WorkItem[] = [
  {
    name: 'Yojit Enterprises',
    sector: 'Dairy processing equipment manufacturer, Nashik',
    type: 'Manufacturer website',
    url: 'https://manojrashinkar.com/yojit-enterprises',
    highlights: [
      'Product range presented for technical buyers',
      'Built mobile-first for on-site browsing',
      'Direct enquiry routes to the business',
    ],
  },
];

export const workNote =
  'This page grows one project at a time. We do not publish a client’s work until that client has ' +
  'agreed to it, so what you see here is limited by consent rather than by how much has been built. ' +
  'If you would like to see something closer to your own sector, ask directly and we will tell you ' +
  'honestly what we can and cannot share.';

export interface Step {
  n: string;
  title: string;
  body: string;
}

export const steps: Step[] = [
  { n: '01', title: 'Discovery', body: 'What the business does, who its customers are, and what the site has to achieve.' },
  { n: '02', title: 'Scope', body: 'Pages, features and architecture agreed in writing, with anything chargeable named up front.' },
  { n: '03', title: 'Content', body: 'Text, photographs and brand material gathered. Rough material is fine — we shape it.' },
  { n: '04', title: 'Design and build', body: 'Built responsively from the start, with contact and enquiry routes wired in as we go.' },
  { n: '05', title: 'Review and test', body: 'Checked on real devices and browsers, then reviewed by you before it goes near a live domain.' },
  { n: '06', title: 'Launch and handover', body: 'Domain connected, SSL verified, site deployed — then the accounts and guidance are yours.' },
];

export const commitments: string[] = [
  'No fixed price list, because no two projects involve the same work. A quotation follows a scope discussion.',
  'No promises about Google rankings, traffic or lead volume — nobody can honestly make them.',
  'Third-party costs such as domain, paid hosting and business email are always separate and always named.',
  'Maintenance after launch is optional and separately agreed. Your site keeps running either way.',
  'Source-code ownership is settled in writing as part of the scope, before development begins.',
];
