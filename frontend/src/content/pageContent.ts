// All page copy lives here so wording can be adjusted without touching components.
// `icon` values reference keys in components/Icon.tsx.

export interface CardItem {
  icon: string;
  title: string;
  description: string;
}

export const trustPoints: CardItem[] = [
  { icon: 'shield-check', title: 'Personally Reviewed', description: 'No automated filtering or call centre — every application is read and reviewed by a real person.' },
  { icon: 'user', title: 'Direct Communication', description: "You deal directly with the person building your website, from first message to launch." },
  { icon: 'clipboard-check', title: 'Transparent Process', description: 'No hidden steps. Scope, timeline and any charges are confirmed in writing before work begins.' },
  { icon: 'clock', title: 'Fast Response', description: 'Applications are typically reviewed and responded to within 1–2 business days.' },
];

export const includedServices: CardItem[] = [
  { icon: 'monitor', title: 'Professional Business Website', description: 'A clean, credible website designed around your business and customers.' },
  { icon: 'phone', title: 'Mobile-Friendly Design', description: 'Looks sharp and works smoothly on every phone, tablet and desktop.' },
  { icon: 'document', title: 'Home, About, Services & Contact Pages', description: 'The complete standard structure a business profile website needs.' },
  { icon: 'chat', title: 'WhatsApp Enquiry Button', description: 'Visitors reach you on WhatsApp in a single tap.' },
  { icon: 'edit', title: 'Contact Form', description: 'Capture enquiries directly from your website, any time of day.' },
  { icon: 'map-pin', title: 'Google Maps Integration', description: 'Help customers find your shop, clinic or office easily.' },
  { icon: 'link', title: 'Social-Media Links', description: 'Connect your Facebook, Instagram and LinkedIn profiles.' },
  { icon: 'search', title: 'Basic SEO', description: 'Titles, descriptions and page structure set up for search engines.' },
  { icon: 'lock', title: 'SSL & Deployment Support', description: 'Secure https:// setup and full support until your site is live.' },
];

export const businessCategories: CardItem[] = [
  { icon: 'briefcase', title: 'Consultants', description: 'Present your expertise with a credible professional profile.' },
  { icon: 'heart', title: 'Doctors & Clinics', description: 'Share treatments, timings and location so patients find you easily.' },
  { icon: 'bar-chart', title: 'Chartered Accountants', description: 'Showcase services and make client enquiries effortless.' },
  { icon: 'store', title: 'Local Shops', description: 'Put your shop on the map with products, photos and directions.' },
  { icon: 'wrench', title: 'Service Providers', description: 'Let customers discover, evaluate and contact your service quickly.' },
  { icon: 'cup', title: 'Restaurants', description: 'Present your menu, ambience and location to attract more diners.' },
  { icon: 'target', title: 'Coaches', description: 'Build authority with programmes, results and session enquiries.' },
  { icon: 'trending-up', title: 'Startups', description: 'Launch with a presence that builds investor and customer trust.' },
  { icon: 'layers', title: 'Small Businesses', description: 'Establish credibility online and capture enquiries around the clock.' },
];

export const offerPoints: string[] = [
  'Selected businesses may qualify for reduced or waived development charges under our introductory programme.',
  'Applications are reviewed based on genuine business requirements and project scope.',
  'Domain, hosting, premium services and advanced features may be charged separately.',
  'Submitting an enquiry does not guarantee selection — every application is reviewed individually.',
];

export interface ProcessStep {
  title: string;
  description: string;
}

export const howItWorksSteps: ProcessStep[] = [
  { title: 'Submit your business details', description: 'Fill in the enquiry form below with your business information.' },
  { title: 'We review your requirements', description: 'Our team studies your business profile and website needs — typically within 1–2 business days.' },
  { title: 'Selected clients receive a proposal', description: 'Suitable applicants get a written proposal with confirmed scope and terms.' },
  { title: 'Development starts after scope confirmation', description: 'Once the scope is agreed, we design, build and launch your website.' },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Is development completely free?',
    answer:
      'Not automatically. This is a limited introductory programme under which selected businesses may qualify for reduced or waived development charges. Any concession is confirmed only through a written proposal after review. Domain, hosting and third-party costs are separate.',
  },
  {
    question: 'Who can apply?',
    answer:
      'Any business or professional that needs a genuine online presence — consultants, clinics, shops, restaurants, coaches, startups and small businesses. Simply submit the enquiry form with your business details.',
  },
  {
    question: 'Does applying guarantee selection?',
    answer:
      'No. Submitting the form registers your interest and helps us understand your requirements. Applications are reviewed individually, and selection depends on suitability and available capacity.',
  },
  {
    question: 'Are domain and hosting included?',
    answer:
      'Domain registration and hosting are typically payable by the business owner unless a proposal specifically states otherwise. We guide you in choosing cost-effective options.',
  },
  {
    question: 'How long does development take?',
    answer:
      'A standard business website usually takes one to three weeks after content is received. Timelines depend on how quickly content and feedback are provided.',
  },
  {
    question: 'Can I request additional features?',
    answer:
      'Yes. E-commerce, payment gateways, booking systems, admin dashboards and other advanced features are available as separately quoted services — mention them in your enquiry.',
  },
  {
    question: 'Is future maintenance included?',
    answer:
      'Maintenance after deployment is offered as a separate, optional service. We will explain the options clearly before you decide.',
  },
];

export const categoryOptions = businessCategories.map((c) => c.title);
