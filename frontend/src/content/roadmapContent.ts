// All copy for the Development Roadmap page. Kept as plain data so wording can
// be adjusted without touching components — same convention as pageContent.ts.
// `icon` values reference keys in components/Icon.tsx.

import type { FaqItem } from './pageContent';

/* ---------- Hero flow ---------- */

export const heroFlow: string[] = [
  'Business Requirements',
  'Planning',
  'Design',
  'Development',
  'Domain & Hosting',
  'Testing',
  'Launch',
  'Support',
];

/* ---------- Section navigation ---------- */

export interface SectionLink {
  id: string;
  label: string;
}

export const sectionLinks: SectionLink[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'website-options', label: 'Website Options' },
  { id: 'process', label: 'Development Process' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'technologies', label: 'Technologies' },
  { id: 'hosting', label: 'Hosting' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'support', label: 'Support' },
  { id: 'roadmap-faq', label: 'FAQs' },
];

/* ---------- Section 2: guiding principles ---------- */

export interface PrinciplePoint {
  icon: string;
  title: string;
  description: string;
}

export const architecturePrinciples: PrinciplePoint[] = [
  {
    icon: 'clipboard-check',
    title: 'Requirement-based planning',
    description: 'The architecture is chosen after your requirements are understood, not before.',
  },
  {
    icon: 'key',
    title: 'Client-owned domain',
    description: 'Your domain stays registered in your name, in your own registrar account.',
  },
  {
    icon: 'trending-up',
    title: 'Scalable technology',
    description: 'Start with what you need today, with room to grow as the business grows.',
  },
  {
    icon: 'clipboard-check',
    title: 'Transparent delivery',
    description: 'Scope, responsibilities and any separate charges are confirmed in writing.',
  },
];

/* ---------- Section 3: the two solution paths ---------- */

export interface SolutionOption {
  id: string;
  name: string;
  badge: string;
  summary: string;
  icon: string;
  suitableHeading: string;
  suitableFor: string[];
  detailHeading: string;
  details: string[];
  architectureHeading: string;
  architecture: string[];
  notesHeading: string;
  notes: string[];
  footnote: string;
}

export const solutionOptions: SolutionOption[] = [
  {
    id: 'profile',
    name: 'Business Profile Website',
    badge: 'Best for Small and Growing Businesses',
    icon: 'store',
    summary:
      'An informational website that presents your business clearly and makes it easy for customers to enquire. No server administration, no database, no backend to maintain.',
    suitableHeading: 'Suitable for',
    suitableFor: [
      'Company profile websites',
      'Local businesses',
      'Consultants',
      'Professionals',
      'Manufacturers',
      'Service businesses',
      'Clinics',
      'Restaurants',
      'Traders',
      'Product information websites',
      'Portfolio websites',
    ],
    detailHeading: 'Typical features',
    details: [
      'Home page',
      'About the business',
      'Services',
      'Products',
      'Gallery',
      'Contact details',
      'WhatsApp button',
      'Phone link',
      'Email link',
      'Google Maps',
      'Social-media links',
      'Enquiry form',
      'Basic SEO',
      'Responsive mobile design',
      'Desktop optimisation',
      'SSL',
      'Fast loading',
    ],
    architectureHeading: 'Recommended architecture',
    architecture: [
      'Client-Owned Domain',
      'DNS Configuration',
      "Client's Vercel Account",
      'Developer-Managed Private GitHub Repository',
      'Next.js Website',
      'Automatic Deployment and SSL',
    ],
    notesHeading: 'What this means in plain language',
    notes: [
      'No Ubuntu server is normally required.',
      'Nginx is normally not required.',
      'A separate backend is normally not required.',
      'GoDaddy or Namecheap hosting is not required when Vercel is used.',
      'The domain can be purchased from any registrar you prefer.',
      'The domain is owned by you.',
      'The Vercel account may also be owned by you.',
      'The developer connects only the one GitHub repository your website needs.',
      'Other private GitHub repositories stay protected and unconnected.',
      'Vercel handles deployment, CDN delivery, HTTPS and serving the website.',
    ],
    footnote:
      'Recommended for informational websites without complex user accounts, databases, or business workflows.',
  },
  {
    id: 'application',
    name: 'Advanced Web Application',
    badge: 'Best for Complex and Scalable Platforms',
    icon: 'layers',
    summary:
      'A platform your business runs on — with user accounts, stored data, workflows and its own infrastructure. Built when a website alone cannot do the job.',
    suitableHeading: 'Suitable for',
    suitableFor: [
      'Customer portals',
      'Admin dashboards',
      'E-commerce platforms',
      'News portals',
      'Subscription platforms',
      'Trading applications',
      'Analytics dashboards',
      'Multi-user applications',
      'Database-driven platforms',
      'Payment-enabled systems',
      'Internal business applications',
      'High-traffic platforms',
      'Custom software',
    ],
    detailHeading: 'This option may be required when the application includes',
    details: [
      'User registration',
      'Login',
      'Admin panel',
      'Database',
      'Payment gateway',
      'File uploads',
      'APIs',
      'Business workflows',
      'Background jobs',
      'Real-time data',
      'High-volume analytics',
      'Custom security',
      'Full infrastructure control',
    ],
    architectureHeading: 'Typical architecture',
    architecture: [
      'Client-Owned Domain',
      'Cloudflare DNS and Security',
      'Ubuntu VPS or Cloud Platform',
      'Nginx Reverse Proxy',
      'Next.js or React Frontend',
      'FastAPI, Node.js, or Django Backend',
      'PostgreSQL, Supabase, MySQL, ClickHouse, or MongoDB',
      'Storage, Backups, Monitoring, and Security',
    ],
    notesHeading: 'What this means in plain language',
    notes: [
      'A server is used because the application has to store and process data of its own.',
      'Nginx sits in front of the application and directs incoming traffic to the right service.',
      'A database keeps your users, orders, records and transactions safe and queryable.',
      'Backups and monitoring are part of the build, not an afterthought.',
      'Infrastructure is sized to the expected number of users, not to a fixed template.',
    ],
    footnote:
      'Technology is selected only after reviewing the exact business and technical requirements.',
  },
];

/* ---------- Section 4: architecture comparison ---------- */

export interface ComparisonRow {
  area: string;
  profile: string;
  application: string;
}

export const comparisonRows: ComparisonRow[] = [
  { area: 'Primary purpose', profile: 'Business information and enquiries', application: 'Business operations and user workflows' },
  { area: 'Frontend', profile: 'Next.js or React', application: 'Next.js or React' },
  { area: 'Backend', profile: 'Usually not required', application: 'Commonly required' },
  { area: 'Database', profile: 'Usually not required', application: 'Commonly required' },
  { area: 'Hosting', profile: 'Managed hosting', application: 'Managed cloud or custom server' },
  { area: 'Server', profile: 'Not normally required', application: 'May be required' },
  { area: 'Nginx', profile: 'Not normally required', application: 'Often used with a VPS' },
  { area: 'Deployment', profile: 'GitHub to Vercel', application: 'CI/CD or server deployment' },
  { area: 'Maintenance', profile: 'Low', application: 'Moderate to high' },
  { area: 'Scalability', profile: 'Suitable for normal business traffic', application: 'Designed according to application load' },
  { area: 'Pricing', profile: 'Based on project scope', application: 'Custom quotation' },
];

export const comparisonLabels = {
  profile: ['Low infrastructure requirement', 'Managed deployment', 'Scope-based quotation'],
  application: ['Custom infrastructure', 'Advanced maintenance', 'Scope-based quotation'],
};

/* ---------- Section 5: delivery roadmap ---------- */

export type Responsibility = 'Client' | 'Developer' | 'Both' | string;

export interface RoadmapPhase {
  id: string;
  icon: string;
  title: string;
  summary: string;
  responsibility: Responsibility;
  tasks: string[];
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'discovery',
    icon: 'compass',
    title: 'Discovery',
    summary:
      'We agree on what the website has to achieve before any design or code is produced.',
    responsibility: 'Both',
    tasks: [
      'Business requirement discussion',
      'Website goals',
      'Target audience',
      'Required features',
      'Project scope',
      'Initial architecture recommendation',
    ],
  },
  {
    id: 'content',
    icon: 'folder',
    title: 'Content and Planning',
    summary:
      'Your business material is gathered and the page structure is agreed, so development is never blocked waiting for content.',
    responsibility: 'Client and Developer',
    tasks: [
      'Domain-name selection',
      'Business information collection',
      'Logo and branding',
      'Images and documents',
      'Services and product information',
      'Page structure',
      'Sitemap',
      'Content approval',
    ],
  },
  {
    id: 'build',
    icon: 'palette',
    title: 'Design and Development',
    summary:
      'The website is designed and built, with contact, enquiry and location features connected as we go.',
    responsibility: 'Developer',
    tasks: [
      'UI and UX planning',
      'Responsive layout',
      'Website development',
      'Reusable components',
      'WhatsApp integration',
      'Contact integration',
      'Google Maps',
      'Forms',
      'SEO structure',
    ],
  },
  {
    id: 'testing',
    icon: 'clipboard-check',
    title: 'Review and Testing',
    summary:
      'Everything is checked on real devices and browsers, and you review the site before it goes anywhere near a live domain.',
    responsibility: 'Both',
    tasks: [
      'Mobile testing',
      'Desktop testing',
      'Browser testing',
      'Link verification',
      'Form testing',
      'Performance review',
      'Content review',
      'Client revisions',
      'Final approval',
    ],
  },
  {
    id: 'launch',
    icon: 'rocket',
    title: 'Domain and Launch',
    summary:
      'The approved website is connected to your domain, secured with SSL and published.',
    responsibility: 'Developer with client-authorised access',
    tasks: [
      'Hosting project setup',
      'Domain connection',
      'DNS configuration',
      'SSL verification',
      'Production deployment',
      'Final quality check',
      'Website launch',
    ],
  },
  {
    id: 'handover',
    icon: 'headset',
    title: 'Handover and Support',
    summary:
      'You receive the accounts, the explanation and a clear path for future updates.',
    responsibility: 'Both',
    tasks: [
      'Technical handover',
      'Account ownership confirmation',
      'Maintenance guidance',
      'Backup guidance',
      'Future update process',
      'Optional maintenance plan',
      'Future feature expansion',
    ],
  },
];

/* ---------- Section 6: what we need from the client ---------- */

export interface ChecklistGroup {
  icon: string;
  title: string;
  items: string[];
}

export const clientChecklist: ChecklistGroup[] = [
  {
    icon: 'briefcase',
    title: 'Business Details',
    items: [
      'Business name',
      'Business description',
      'Business history',
      'Services',
      'Products',
      'Target customers',
      'Unique selling points',
      'Service locations',
      'Working hours',
    ],
  },
  {
    icon: 'phone',
    title: 'Contact Details',
    items: [
      'Phone number',
      'WhatsApp number',
      'Email address',
      'Office address',
      'Google Maps location',
      'Social-media links',
    ],
  },
  {
    icon: 'palette',
    title: 'Brand Materials',
    items: [
      'Logo',
      'Brand colours',
      'Preferred visual style',
      'Brochure',
      'Product catalogue',
      'Existing marketing material',
    ],
  },
  {
    icon: 'image',
    title: 'Website Content',
    items: [
      'About-us content',
      'Service descriptions',
      'Product information',
      'Images',
      'Videos',
      'Certifications',
      'Awards',
      'Testimonials',
      'Client logos where authorised',
      'Legal information',
    ],
  },
  {
    icon: 'settings',
    title: 'Technical Information',
    items: [
      'Purchased domain name',
      'Domain registrar',
      'DNS or delegated access',
      'Hosting account where applicable',
      'Business email requirement',
      'Existing website details',
      'Required integrations',
    ],
  },
];

export const checklistSecurityNote =
  'Do not share permanent account passwords when delegated access or controlled DNS access is available.';

/* ---------- Section 7: ownership ---------- */

export interface OwnershipColumn {
  icon: string;
  title: string;
  tone: 'client' | 'developer' | 'shared';
  items: string[];
}

export const ownershipColumns: OwnershipColumn[] = [
  {
    icon: 'key',
    title: 'Client Owns',
    tone: 'client',
    items: [
      'Domain name',
      'Domain registrar account',
      'Hosting account where agreed',
      'Business email',
      'Company content',
      'Third-party subscriptions',
      'Final approval',
      'Renewal payments',
    ],
  },
  {
    icon: 'code',
    title: 'Developer Manages',
    tone: 'developer',
    items: [
      'Website design',
      'Website development',
      'GitHub repository',
      'Deployment configuration',
      'DNS setup',
      'SSL verification',
      'Performance optimisation',
      'Responsive testing',
      'Technical updates',
      'Agreed maintenance',
    ],
  },
  {
    icon: 'users',
    title: 'Managed Together',
    tone: 'shared',
    items: [
      'Scope confirmation',
      'Content review',
      'Website testing',
      'Revisions',
      'Launch approval',
      'Future upgrades',
    ],
  },
];

export const ownershipNotes: string[] = [
  'A GoDaddy domain can be hosted on Vercel.',
  'A Namecheap domain can be hosted on Vercel.',
  'The registrar and the hosting provider can be two different companies.',
  'Purchasing a domain does not require purchasing hosting from the same company.',
  'The website can later be moved to another compatible hosting provider.',
  'Domain ownership remains with the client throughout.',
];

/* ---------- Section 8: deployment workflow ---------- */

export const deploymentFlow: string[] = [
  "Developer's Private GitHub Repository",
  "Client's Vercel Project",
  "Client's Custom Domain",
];

export const deploymentPoints: string[] = [
  'Each client website is stored in a separate private GitHub repository.',
  "Only the required repository is connected to the client's Vercel project.",
  'GitHub access should use the "Only selected repositories" option.',
  'Other personal or client repositories are never exposed.',
  'Approved code changes can deploy automatically once merged.',
  'The client does not need access to unrelated projects.',
  'Secrets must not be saved directly inside source code.',
  'Environment variables are used for sensitive configuration.',
  'The client retains control of the domain and the hosting account.',
];

export const deploymentSecurityNote =
  'Never authorise access to all GitHub repositories when only one project repository is required.';

/* ---------- Section 9: technologies ---------- */

export interface TechnologyCard {
  name: string;
  icon: string;
  purpose: string;
  whenRequired: string;
  suitableFor: string;
  group: 'core' | 'advanced';
  note?: string;
}

export const technologies: TechnologyCard[] = [
  {
    name: 'Next.js',
    icon: 'code',
    group: 'core',
    purpose:
      'Builds the pages visitors actually see — including SEO-friendly pages, responsive interfaces, and both static and dynamic rendering.',
    whenRequired: 'Used on almost every project as the website framework.',
    suitableFor: 'Business websites and advanced applications',
  },
  {
    name: 'React',
    icon: 'layers',
    group: 'core',
    purpose:
      'Powers interactive interfaces, reusable components and dynamic sections inside the website.',
    whenRequired: 'Whenever parts of the page need to respond to the visitor.',
    suitableFor: 'Business websites and applications',
  },
  {
    name: 'GitHub',
    icon: 'git-branch',
    group: 'core',
    purpose:
      'Stores the source code with version control, a full change history and deployment integration.',
    whenRequired: 'On every project, so nothing is ever lost and every change is traceable.',
    suitableFor: 'All projects',
  },
  {
    name: 'Vercel',
    icon: 'cloud',
    group: 'core',
    purpose:
      'Hosts the website, deploys it straight from Git, and provides SSL, a global CDN and custom-domain connection.',
    whenRequired: 'When a managed, low-maintenance hosting setup is the right fit.',
    suitableFor: 'Business websites and managed frontend applications',
  },
  {
    name: 'Cloudflare',
    icon: 'shield-check',
    group: 'core',
    purpose: 'Handles DNS, CDN delivery, caching, security and DDoS protection.',
    whenRequired: 'When you want faster delivery and an extra security layer in front of the site.',
    suitableFor: 'Small and advanced projects',
  },
  {
    name: 'Ubuntu',
    icon: 'server',
    group: 'advanced',
    purpose:
      'The operating system of a custom server — used to host a backend, a database and full infrastructure you control.',
    whenRequired: 'Only when the application genuinely needs its own server.',
    suitableFor: 'Advanced platforms',
  },
  {
    name: 'Nginx',
    icon: 'link',
    group: 'advanced',
    purpose:
      'Acts as a reverse proxy — routing your domain to the right service, forwarding traffic, terminating SSL and serving static files.',
    whenRequired: 'When the project runs on a custom Ubuntu server or VPS.',
    suitableFor: 'Custom Ubuntu or VPS hosting',
    note: 'Nginx is generally not required when the website is fully hosted on Vercel.',
  },
  {
    name: 'FastAPI',
    icon: 'zap',
    group: 'advanced',
    purpose:
      'A Python backend for APIs, business logic, authentication, data processing and database operations.',
    whenRequired: 'When the application has to process data or enforce business rules server-side.',
    suitableFor: 'Advanced applications',
  },
  {
    name: 'Node.js',
    icon: 'code',
    group: 'advanced',
    purpose:
      'A JavaScript backend for APIs, real-time services and business workflows.',
    whenRequired: 'When a JavaScript backend suits the project or the team better.',
    suitableFor: 'Advanced applications',
  },
  {
    name: 'PostgreSQL',
    icon: 'database',
    group: 'advanced',
    purpose:
      'Stores structured business data — users, products, orders, enquiries and transactions.',
    whenRequired: 'When the application must remember and query information reliably.',
    suitableFor: 'Database-driven applications',
  },
  {
    name: 'Supabase',
    icon: 'database',
    group: 'advanced',
    purpose:
      'Managed PostgreSQL together with authentication, storage and ready-made APIs for a fast backend setup.',
    whenRequired: 'When you need a backend quickly without running your own server.',
    suitableFor: 'Small and medium applications',
  },
  {
    name: 'ClickHouse',
    icon: 'bar-chart',
    group: 'advanced',
    purpose:
      'Handles high-volume analytics, time-series data and fast analytical queries.',
    whenRequired: 'When reporting runs over very large volumes of data.',
    suitableFor: 'Analytics-intensive systems',
  },
  {
    name: 'Cloud Infrastructure',
    icon: 'cloud',
    group: 'advanced',
    purpose:
      'Custom servers, backend services, databases, storage and scaling — on AWS, Google Cloud, DigitalOcean, Utho, Hetzner or another suitable VPS provider.',
    whenRequired: 'When the platform needs infrastructure sized and controlled specifically for it.',
    suitableFor: 'Advanced platforms',
  },
];

/* ---------- Section 10: hosting options ---------- */

export interface HostingOption {
  icon: string;
  title: string;
  examples: string[];
  bestFor: string[];
  benefits?: string[];
}

export const hostingOptions: HostingOption[] = [
  {
    icon: 'cloud',
    title: 'Managed Website Hosting',
    examples: ['Vercel', 'Cloudflare Pages', 'Netlify'],
    bestFor: [
      'Company-profile websites',
      'Portfolio websites',
      'Static websites',
      'Small business websites',
      'Frontend projects',
      'Low-maintenance deployment',
    ],
    benefits: [
      'GitHub integration',
      'Automatic SSL',
      'CDN',
      'Easy deployment',
      'Lower server-maintenance requirement',
    ],
  },
  {
    icon: 'database',
    title: 'Managed Application Services',
    examples: ['Supabase', 'Railway', 'Render', 'Managed PostgreSQL', 'Serverless functions'],
    bestFor: [
      'Enquiry systems',
      'Authentication',
      'Small databases',
      'Early-stage applications',
      'Lightweight APIs',
    ],
  },
  {
    icon: 'server',
    title: 'Custom Cloud Server',
    examples: ['Ubuntu VPS', 'AWS', 'Google Cloud', 'DigitalOcean', 'Utho', 'Hetzner'],
    bestFor: [
      'Custom backend systems',
      'Multiple services',
      'Advanced security',
      'Full server control',
      'Databases',
      'Background workers',
      'Complex integrations',
    ],
  },
];

export const hostingStatement =
  "We do not apply the same hosting architecture to every website. Hosting is selected according to the project's functionality, traffic, budget, security, maintenance, and growth requirements.";

/* ---------- Section 11: pricing approach ---------- */

export const pricingFactors: string[] = [
  'Number of pages',
  'Custom design',
  'Content preparation',
  'Image preparation',
  'Functionality',
  'Forms',
  'Integrations',
  'Backend development',
  'Database requirements',
  'Admin panel',
  'Authentication',
  'Payment gateway',
  'Hosting architecture',
  'Security',
  'Testing',
  'Deployment',
  'Maintenance',
  'Future scalability',
];

export interface PricingCategory {
  icon: string;
  title: string;
  suitableFor: string[];
  priceLabel: string;
  secondaryLabel?: string;
  featured?: boolean;
}

export const pricingCategories: PricingCategory[] = [
  {
    icon: 'store',
    title: 'Business Profile Website',
    suitableFor: [
      'Company profiles',
      'Consultants',
      'Local businesses',
      'Service providers',
      'Manufacturers',
    ],
    priceLabel: 'Complimentary for Selected Initial Projects',
    secondaryLabel: 'Subject to scope review and approval',
    featured: true,
  },
  {
    icon: 'briefcase',
    title: 'Professional Business Website',
    suitableFor: [
      'More pages',
      'Product catalogues',
      'Custom sections',
      'Advanced forms',
      'Stronger SEO requirements',
      'Additional integrations',
    ],
    priceLabel: 'Quotation Based on Project Scope',
  },
  {
    icon: 'layers',
    title: 'Advanced Web Application',
    suitableFor: [
      'Login',
      'Admin panels',
      'Databases',
      'Payments',
      'APIs',
      'Dashboards',
      'Multi-user systems',
      'Complex workflows',
    ],
    priceLabel: 'Custom Technical and Commercial Proposal',
  },
];

/* ---------- Section 12: complimentary development ---------- */

export const complimentaryIntro =
  'To establish strong business relationships and expand our professional portfolio, selected initial business-profile websites may be developed without a development fee, subject to scope review and approval.';

export const complimentaryTerms: string[] = [
  'Available only for selected projects.',
  'Domain charges are paid by the client.',
  'Paid hosting charges are paid by the client where applicable.',
  'Business email charges are paid by the client.',
  'Premium services and APIs are paid by the client.',
  'Advanced functionality may require a separate quotation.',
  'Maintenance may be chargeable after launch.',
  'Content must be supplied or approved by the client.',
  'Revisions are limited to the agreed scope.',
  'The final scope is confirmed before development begins.',
];

/* ---------- Section 13: third-party charges ---------- */

export const thirdPartyCharges: string[] = [
  'Domain registration',
  'Domain renewal',
  'Paid hosting',
  'Business email',
  'Premium APIs',
  'Payment-gateway charges',
  'SMS services',
  'WhatsApp Business API',
  'Database usage',
  'Cloud storage',
  'VPS or cloud-server cost',
  'Backup services',
  'Monitoring',
  'Licensed images',
  'Premium fonts',
  'Premium plugins',
  'Ongoing maintenance',
];

export const thirdPartyStatements: string[] = [
  'Development fees and third-party charges are separate.',
  'The client retains ownership of the domain and normally pays domain-renewal charges directly.',
  'Third-party pricing is controlled by the respective provider and may change.',
];

/* ---------- Section 14: deliverables ---------- */

export const standardDeliverables: string[] = [
  'Requirement analysis',
  'Website planning',
  'Responsive design',
  'Mobile optimisation',
  'Desktop optimisation',
  'Next.js development',
  'Domain connection',
  'DNS configuration',
  'SSL verification',
  'Live deployment',
  'GitHub version control',
  'WhatsApp integration',
  'Telephone integration',
  'Email integration',
  'Google Maps integration',
  'Basic enquiry options',
  'Basic SEO',
  'Performance optimisation',
  'Browser testing',
  'Client review',
  'Production launch',
  'Technical handover',
  'Maintenance guidance',
];

export const optionalDeliverables: string[] = [
  'Backend API',
  'Database',
  'Authentication',
  'Admin dashboard',
  'Payment integration',
  'Monitoring',
  'Backup system',
  'Custom-server deployment',
];

/* ---------- Section 15: support ---------- */

export interface SupportTier {
  icon: string;
  title: string;
  labels: string[];
  items: string[];
}

export const supportTiers: SupportTier[] = [
  {
    icon: 'wrench',
    title: 'Essential Website Support',
    labels: ['Optional', 'Monthly support'],
    items: [
      'Minor text updates',
      'Contact-detail changes',
      'Image replacement',
      'Link corrections',
      'Basic technical support',
    ],
  },
  {
    icon: 'refresh',
    title: 'Business Website Management',
    labels: ['Monthly support', 'Annual support'],
    items: [
      'Regular content updates',
      'New sections',
      'SEO improvements',
      'Performance checks',
      'Hosting assistance',
      'DNS support',
      'Deployment support',
    ],
  },
  {
    icon: 'server',
    title: 'Advanced Application Maintenance',
    labels: ['Custom quotation'],
    items: [
      'Ubuntu server maintenance',
      'Nginx configuration',
      'Backend updates',
      'Database backups',
      'Security updates',
      'Monitoring',
      'Error investigation',
      'API maintenance',
      'Feature upgrades',
    ],
  },
];

/* ---------- Section 16: FAQs ---------- */

export const roadmapFaqItems: FaqItem[] = [
  {
    question: 'Who owns the domain?',
    answer:
      'You do. The domain is registered in your name, in your own registrar account, and it stays that way.',
  },
  {
    question: 'Can the domain be purchased from GoDaddy?',
    answer: 'Yes. GoDaddy is a perfectly good registrar and works with the setup we use.',
  },
  {
    question: 'Can the domain be purchased from Namecheap?',
    answer: 'Yes. Namecheap works equally well. You may buy the domain from any registrar you prefer.',
  },
  {
    question: 'Does the domain need to be purchased from Vercel?',
    answer:
      'No. Vercel can host a website on a domain bought anywhere. Buying the domain through Vercel is only a convenience, never a requirement.',
  },
  {
    question: 'Can a GoDaddy domain be connected to Vercel?',
    answer:
      'Yes. We update a couple of DNS records in your GoDaddy account and the domain points to the website hosted on Vercel.',
  },
  {
    question: 'Do I need GoDaddy hosting?',
    answer:
      'Not for a business profile website hosted on Vercel. You only need the domain from GoDaddy — the hosting plan is a separate product you can skip.',
  },
  {
    question: 'Do I need Namecheap hosting?',
    answer:
      'No, for the same reason. The registrar sells the domain; the hosting can come from a different provider.',
  },
  {
    question: 'Is an Ubuntu server required?',
    answer:
      'Not for a normal business profile website. An Ubuntu server is used when the project needs its own backend, database or full infrastructure control.',
  },
  {
    question: 'Is Nginx required?',
    answer:
      'Only when the project runs on a custom server or VPS. If the website is hosted on Vercel, Nginx is not part of the setup.',
  },
  {
    question: 'Can a basic website work without a backend?',
    answer:
      'Yes. An informational website with pages, images, a contact form and WhatsApp links does not need a backend of its own.',
  },
  {
    question: 'Who owns the Vercel account?',
    answer:
      'It can be yours. We recommend the hosting account is created in your name so you always retain control.',
  },
  {
    question: 'Can the client create their own Vercel account?',
    answer:
      'Yes, and this is the preferred arrangement. We are then added only to the specific project that needs to be deployed.',
  },
  {
    question: "Can the developer's private GitHub repository connect to the client's Vercel account?",
    answer:
      'Yes. GitHub allows access to be granted for selected repositories only, so your Vercel project can build from that one repository.',
  },
  {
    question: "Will the developer's other GitHub repositories be visible?",
    answer:
      'No. When access is granted using the "Only selected repositories" option, nothing else is visible or reachable.',
  },
  {
    question: 'Can access be limited to one repository?',
    answer:
      'Yes, and it should be. Granting access to all repositories is never necessary when only one project is being deployed.',
  },
  {
    question: 'Who owns the source code?',
    answer:
      'Source-code ownership is confirmed in writing as part of the agreed scope, so there is no ambiguity later.',
  },
  {
    question: 'Can the website move to another developer?',
    answer:
      'Yes. The code lives in a standard GitHub repository and the site runs on standard technology, so another developer can take it forward.',
  },
  {
    question: 'Can the website move to another hosting provider?',
    answer:
      'Yes. Because you own the domain, moving to another compatible provider is a DNS change, not a rebuild.',
  },
  {
    question: 'Can the website be upgraded later?',
    answer:
      'Yes. New pages, new sections, and later a backend or admin panel, can all be added as the business grows.',
  },
  {
    question: 'Will the website work on mobile?',
    answer:
      'Yes. The website is built responsively and tested on mobile, tablet and desktop before launch.',
  },
  {
    question: 'Is SSL included?',
    answer:
      'Yes. Managed hosting issues and renews the SSL certificate automatically, so your site loads over https.',
  },
  {
    question: 'Can WhatsApp be connected?',
    answer:
      'Yes. A one-tap WhatsApp button can open a chat with your number, with a pre-filled enquiry message.',
  },
  {
    question: 'Can Google Maps be connected?',
    answer: 'Yes. Your shop, clinic or office location can be embedded so customers can find you easily.',
  },
  {
    question: 'Can an enquiry form be added?',
    answer:
      'Yes. A basic enquiry form is part of the standard scope. More advanced form workflows are quoted separately.',
  },
  {
    question: 'Can business email be configured?',
    answer:
      'Yes. Email on your own domain can be set up with a provider of your choice. The mailbox subscription is paid by you.',
  },
  {
    question: 'Who pays for domain renewal?',
    answer:
      'You do, directly to your registrar. Paying it yourself is what keeps ownership clearly with you.',
  },
  {
    question: 'Who pays for hosting?',
    answer:
      'Where a paid hosting plan is needed, it is paid by you. Many business profile websites run comfortably on a free managed hosting tier.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'You receive a technical handover, confirmation of account ownership and guidance on updates and backups. Support after that is optional.',
  },
  {
    question: 'Is maintenance compulsory?',
    answer:
      'No. Maintenance is an optional, separately agreed service. The website continues to run whether or not you take it.',
  },
  {
    question: 'Does every website use the same technologies?',
    answer:
      'No. The architecture is chosen for each project based on requirements, traffic, budget, security and growth plans.',
  },
];
