// Honest before/after framing. Every "without" line is a real, everyday
// friction a business owner recognises — no invented statistics, no claims
// about results a website is not able to guarantee.

export interface ComparisonPair {
  icon: string;
  without: string;
  with: string;
}

export const presencePairs: ComparisonPair[] = [
  {
    icon: 'search',
    without: 'Customers search for your business and find nothing they can trust.',
    with: 'They find a proper website that confirms you are a real, established business.',
  },
  {
    icon: 'chat',
    without: 'The same questions about services and rates get answered on WhatsApp every day.',
    with: 'Your services are explained properly once, and you send one link instead.',
  },
  {
    icon: 'document',
    without: 'Brochures and photos are re-sent to every new enquiry.',
    with: 'Everything lives in one place customers can browse on their own time.',
  },
  {
    icon: 'user',
    without: 'New customers arrive only through people who already know you.',
    with: 'People searching for what you offer can find and contact you directly.',
  },
  {
    icon: 'briefcase',
    without: 'Competitors with a website look more established than you do.',
    with: 'You present at least as professionally as anyone else in your market.',
  },
  {
    icon: 'map-pin',
    without: 'Your address, timings and contact details are scattered across apps.',
    with: 'One page carries your location, hours, phone, WhatsApp and enquiry form.',
  },
];
