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

/* ------------------------------------------------------------------
   Per-page copy.
   Each page needs to stand on its own — someone can arrive at any of
   them from a search result without having seen the home page.
   ------------------------------------------------------------------ */

export interface PageMeta {
  /** Path relative to the site root. '' is the home page. */
  path: string;
  /** Label in the navigation. */
  nav: string;
  /** <title> — kept under about 60 characters. */
  title: string;
  /** Meta description — kept between about 120 and 160 characters. */
  description: string;
  /** The h1. Not always the same as the nav label. */
  heading: string;
  /** The sentence under the h1. */
  lead: string;
}

export const pages = {
  home: {
    path: '',
    nav: 'Home',
    title: 'Web Services — Manoj Rashinkar Venture',
    description:
      'The web development branch of Manoj Rashinkar Venture. Business websites, web applications, ' +
      'redesigns, and domain and hosting setup — built and handed over by the developer himself.',
    heading: 'Websites and web applications for growing businesses',
    lead:
      'The web development branch of Manoj Rashinkar Venture. You deal with the person who builds ' +
      'your project, the scope is agreed in writing, and everything ends up in your name.',
  },
  about: {
    path: 'about',
    nav: 'About Us',
    title: 'About Web Services | Manoj Rashinkar Venture',
    description:
      'Who we are, how the Web Services branch works, and the principles behind it: direct contact ' +
      'with the developer, written scope, and full ownership of everything we build for you.',
    heading: 'About Web Services',
    lead:
      'A small, deliberate operation built around one idea: a business should understand, control ' +
      'and own its own website.',
  },
  services: {
    path: 'services',
    nav: 'Services',
    title: 'Services — Websites & Web Applications | Web Services',
    description:
      'Business websites, web applications, redesign and rescue work, and domain, hosting and launch ' +
      'setup. What each involves, who it suits, and what it does not include.',
    heading: 'What we build',
    lead:
      'Four kinds of work. Most businesses need the first. Some need the second. A fair number arrive ' +
      'needing the third.',
  },
  work: {
    path: 'work',
    nav: 'Our Work',
    title: 'Our Work | Web Services — Manoj Rashinkar Venture',
    description:
      'Projects we are permitted to show publicly. A client’s work appears here only once that client ' +
      'has agreed to it, so this page grows by consent rather than all at once.',
    heading: 'Our work',
    lead:
      'Everything on this page is here because the client agreed to it. Nothing is here because it ' +
      'filled a gap.',
  },
  process: {
    path: 'process',
    nav: 'Process',
    title: 'How a Project Runs | Web Services',
    description:
      'The six stages of a web development project: discovery, scope, content, design and build, ' +
      'review and testing, then launch and handover. What happens at each, and what we need from you.',
    heading: 'How a project runs',
    lead:
      'Six stages, in order. You know what is happening at each one, and what is needed from you ' +
      'before it can move on.',
  },
  contact: {
    path: 'contact',
    nav: 'Contact',
    title: 'Contact Web Services | Manoj Rashinkar Venture',
    description:
      'Start a conversation about your website or web application. Tell us what your business does ' +
      'and what you need — we will tell you honestly whether we are the right fit.',
    heading: 'Start a conversation',
    lead:
      'No obligation and no sales sequence. Describe the business and what you need, and you will get ' +
      'a straight answer about whether we can help.',
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;

/** Navigation order. */
export const navOrder: PageKey[] = ['home', 'about', 'services', 'work', 'process', 'contact'];

/* ---------------- About page ---------------- */

export const aboutStory: string[] = [
  'Manoj Rashinkar Venture covers a few different lines of work. Web Services is the branch that ' +
    'builds for the web — company websites, catalogues, web applications and the infrastructure ' +
    'underneath them.',
  'It exists because of a pattern that keeps repeating. A business pays for a website, and a year ' +
    'later cannot update its own phone number. The domain sits in somebody else’s account. Nobody ' +
    'can explain what the monthly charge is for. The site was never tested on a phone, which is ' +
    'where nearly all of its visitors actually are.',
  'None of that is a technical failure. It is a failure of arrangement — of who owns what, who can ' +
    'change what, and what was agreed at the start. So that is what this branch is organised around.',
];

export interface Value {
  icon: string;
  title: string;
  body: string;
}

export const values: Value[] = [
  {
    icon: 'chat',
    title: 'Plain language',
    body:
      'Technical decisions get explained in terms of what they cost you and what they get you. If ' +
      'an explanation only makes sense to a developer, it is not finished.',
  },
  {
    icon: 'shield-check',
    title: 'Nothing you cannot verify',
    body:
      'No client counts, no ratings, no testimonials you cannot trace to a real business. If we ' +
      'cannot show you the evidence, we do not make the claim.',
  },
  {
    icon: 'key',
    title: 'Ownership, not dependency',
    body:
      'The domain is registered in your name. The accounts are yours. If you decide to work with ' +
      'someone else next year, nothing has to be prised loose first.',
  },
  {
    icon: 'clipboard-check',
    title: 'Scope before invoice',
    body:
      'What is included, what is extra, and what is charged by a third party — written down and ' +
      'agreed before development starts, not discovered afterwards.',
  },
];

export const whoWeServe: string[] = [
  'Manufacturers and suppliers whose buyers research online before they call',
  'Local service businesses that currently exist only as a Google Maps listing',
  'Shops and studios that need a proper catalogue rather than a social media feed',
  'Businesses whose current website is dated, slow, or unusable on a phone',
  'Founders who need a working web application, not a brochure',
];

export const founderNote = {
  heading: 'Who you will be dealing with',
  body:
    'Web Services is run by Manoj Rashinkar, who handles the discussion, the design, the ' +
    'development and the handover. There is no account manager in between, which means answers ' +
    'come from the person who actually knows, and nothing is lost in translation between a brief ' +
    'and a build.',
  linkLabel: 'manojrashinkar.com',
  linkUrl: 'https://manojrashinkar.com',
};

/* ---------------- Services page ---------------- */

/** Extra detail shown on the Services page, keyed by capability title. */
export const capabilityDetail: Record<string, { suits: string; note: string }> = {
  'Business websites': {
    suits:
      'Manufacturers, suppliers, service businesses, clinics, studios and shops — anyone whose ' +
      'customers look them up before making contact.',
    note:
      'This is what most businesses actually need. It does not require a server, a database or a ' +
      'monthly subscription, and we will not add one to inflate the work.',
  },
  'Web applications': {
    suits:
      'Businesses running something on spreadsheets and WhatsApp that has outgrown both, or founders ' +
      'building a product rather than a presence.',
    note:
      'These do involve running costs — a server, a database, sometimes paid services. Those are ' +
      'named and explained before anything is agreed, never discovered on a later invoice.',
  },
  'Redesign and rescue': {
    suits:
      'Sites that look dated, load slowly, break on phones, or that nobody at the business can edit ' +
      'because whoever built them has gone quiet.',
    note:
      'The domain and its search history are preserved. Rebuilding does not mean starting again from ' +
      'zero in Google’s eyes, provided it is done carefully.',
  },
  'Domain, hosting and launch': {
    suits:
      'Anyone unsure what they are paying for, who owns their domain, or what happens if they stop ' +
      'paying somebody.',
    note:
      'Domain registration and paid hosting are third-party charges, billed by those providers to ' +
      'you. We set them up in your name and never take custody of them.',
  },
};

export const servicesNote =
  'Not sure which of these you need? That is a normal place to start. Describe what the business ' +
  'does and what is not working, and the right answer usually becomes obvious within one conversation.';

/* ---------------- Process page ---------------- */

/** Expanded per-stage detail for the Process page, keyed by step number. */
export const stepDetail: Record<string, { youProvide: string; youGet: string }> = {
  '01': {
    youProvide: 'A description of the business, who buys from you, and what is not working today.',
    youGet: 'An honest view of whether a website solves your problem, and roughly what shape it takes.',
  },
  '02': {
    youProvide: 'Decisions on the pages and features that matter, and answers on anything unclear.',
    youGet: 'A written scope: pages, features, what is excluded, and every third-party cost named.',
  },
  '03': {
    youProvide: 'Text, photographs, logos and product details. Rough and unedited is fine.',
    youGet: 'Your material organised into a page structure, with gaps identified before they hold things up.',
  },
  '04': {
    youProvide: 'Feedback at the points where a decision is genuinely yours to make.',
    youGet: 'The site built responsively from the start, with enquiry and contact routes wired in.',
  },
  '05': {
    youProvide: 'A proper look through on your own phone and computer, and anything you want changed.',
    youGet: 'Testing across real devices and browsers, and corrections before anything goes live.',
  },
  '06': {
    youProvide: 'Access decisions — which accounts are in your name, and who else needs access.',
    youGet: 'Domain connected, SSL verified, site live, and the accounts and guidance handed to you.',
  },
};

export const processNote =
  'Timelines depend entirely on scope and on how quickly content arrives — content is almost always ' +
  'the slowest part, and it is the part we cannot do for you. We will give you a realistic estimate ' +
  'once the scope is agreed, and we would rather quote honestly than optimistically.';

/* ---------------- Contact page ---------------- */

export const contactExpect: string[] = [
  'A reply from the developer, not an auto-responder or a sales team',
  'Questions about your business before any suggestion about technology',
  'A straight answer if what you need is outside what we do',
  'No pressure, no follow-up sequence, and no obligation to proceed',
];

export const contactHelpful: string[] = [
  'What the business does, and where it operates',
  'Whether you have a website now, and what is wrong with it',
  'What you want a visitor to do — call, enquire, order, book',
  'Whether you already own a domain name',
  'Any deadline you are working towards',
];

export const commitments: string[] = [
  'No fixed price list, because no two projects involve the same work. A quotation follows a scope discussion.',
  'No promises about Google rankings, traffic or lead volume — nobody can honestly make them.',
  'Third-party costs such as domain, paid hosting and business email are always separate and always named.',
  'Maintenance after launch is optional and separately agreed. Your site keeps running either way.',
  'Source-code ownership is settled in writing as part of the scope, before development begins.',
];
