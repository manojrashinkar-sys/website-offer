// Business-type recommendations. Content only — no claims about results,
// no pricing, no invented clients.

export interface BusinessTypeRecommendation {
  id: string;
  label: string;
  icon: string;
  /** Plain-language reason a website helps this kind of business. */
  benefit: string;
  /** Pages a website for this business normally needs. */
  sections: string[];
  /** Features worth including for this business. */
  features: string[];
  /** The call to action that suits how these customers get in touch. */
  exampleCta: string;
  /** Which delivery category this normally falls into. */
  category: 'Business Profile Website' | 'Professional Business Website' | 'Advanced Web Application';
}

export const businessTypes: BusinessTypeRecommendation[] = [
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    icon: 'layers',
    benefit:
      'Buyers and dealers can verify your capability, capacity and certifications before they call — so the enquiries you receive are better qualified.',
    sections: [
      'Company profile',
      'Product catalogue',
      'Industries served',
      'Certifications',
      'Infrastructure gallery',
      'Dealer or enquiry form',
      'Contact',
    ],
    features: ['WhatsApp contact', 'Downloadable catalogue', 'Enquiry form', 'Google Maps', 'Basic SEO'],
    exampleCta: 'Request a Quotation',
    category: 'Professional Business Website',
  },
  {
    id: 'service',
    label: 'Service provider',
    icon: 'wrench',
    benefit:
      'Your services, coverage area and process are explained once on the website instead of being retyped in every WhatsApp conversation.',
    sections: ['Home', 'Services', 'How we work', 'Service areas', 'Gallery', 'Contact'],
    features: ['WhatsApp button', 'Click-to-call', 'Enquiry form', 'Google Maps', 'Basic SEO'],
    exampleCta: 'Book a Service Visit',
    category: 'Business Profile Website',
  },
  {
    id: 'consultant',
    label: 'Consultant',
    icon: 'briefcase',
    benefit:
      'A credible personal brand page gives prospective clients a reason to trust your expertise before the first meeting.',
    sections: ['Personal brand', 'Expertise', 'Services', 'Case studies', 'Testimonials', 'Contact'],
    features: ['Appointment request', 'WhatsApp contact', 'Email link', 'Basic SEO'],
    exampleCta: 'Book a Consultation',
    category: 'Business Profile Website',
  },
  {
    id: 'retailer',
    label: 'Retailer',
    icon: 'store',
    benefit:
      'Customers can browse what you stock and find your shop before visiting, rather than calling to ask what is available.',
    sections: ['Home', 'About', 'Product range', 'Offers', 'Store location', 'Contact'],
    features: ['Product gallery', 'WhatsApp enquiry', 'Google Maps', 'Social links', 'Basic SEO'],
    exampleCta: 'Enquire About Availability',
    category: 'Business Profile Website',
  },
  {
    id: 'restaurant',
    label: 'Restaurant or café',
    icon: 'cup',
    benefit:
      'Your menu, timings and location are available the moment someone searches — and a table request is one tap away.',
    sections: ['Home', 'Menu', 'Gallery', 'Timings', 'Location', 'Contact'],
    features: ['WhatsApp booking', 'Click-to-call', 'Google Maps', 'Photo gallery', 'Social links'],
    exampleCta: 'Reserve a Table',
    category: 'Business Profile Website',
  },
  {
    id: 'construction',
    label: 'Construction or real estate',
    icon: 'target',
    benefit:
      'Completed projects shown properly do the convincing, so serious buyers arrive already confident in your work.',
    sections: ['Home', 'About', 'Projects', 'Services', 'Certifications', 'Enquiry'],
    features: ['Project gallery', 'Enquiry form', 'WhatsApp contact', 'Google Maps', 'Basic SEO'],
    exampleCta: 'Request Project Details',
    category: 'Professional Business Website',
  },
  {
    id: 'healthcare',
    label: 'Healthcare professional',
    icon: 'heart',
    benefit:
      'Patients can check your qualifications, treatments, timings and location without a phone call — and request an appointment directly.',
    sections: ['Home', 'About the doctor', 'Treatments', 'Timings', 'Location', 'Appointment'],
    features: ['Appointment request', 'Click-to-call', 'WhatsApp contact', 'Google Maps'],
    exampleCta: 'Request an Appointment',
    category: 'Business Profile Website',
  },
  {
    id: 'local',
    label: 'Local business',
    icon: 'map-pin',
    benefit:
      'People searching nearby can find you, see what you offer and get directions — the basics that turn a search into a visit.',
    sections: ['Home', 'About', 'What we offer', 'Gallery', 'Location', 'Contact'],
    features: ['Google Maps', 'Click-to-call', 'WhatsApp button', 'Basic SEO'],
    exampleCta: 'Get Directions',
    category: 'Business Profile Website',
  },
  {
    id: 'startup',
    label: 'Startup',
    icon: 'trending-up',
    benefit:
      'A clear, credible product story helps with customers, hiring and investor conversations from day one — and can grow into an application later.',
    sections: ['Home', 'Product', 'How it works', 'Pricing or plans', 'About', 'Contact'],
    features: ['Enquiry form', 'Waitlist capture', 'Basic SEO', 'Analytics-ready'],
    exampleCta: 'Request a Demo',
    category: 'Professional Business Website',
  },
  {
    id: 'other',
    label: 'Other business',
    icon: 'document',
    benefit:
      'Every business is different. Share what you do and we will recommend the structure and features that genuinely fit.',
    sections: ['Home', 'About', 'What you offer', 'Gallery', 'Contact'],
    features: ['WhatsApp contact', 'Enquiry form', 'Google Maps', 'Basic SEO'],
    exampleCta: 'Discuss Requirements',
    category: 'Business Profile Website',
  },
];
