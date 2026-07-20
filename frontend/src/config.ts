// Central place for all environment-driven configuration.
// Nothing here should ever be a hardcoded real phone number, email or domain.

const env = import.meta.env;

export const config = {
  // Base URL of the API. Leave empty to use same-origin requests.
  apiBaseUrl: (env.VITE_API_BASE_URL || '').replace(/\/$/, ''),
  // Endpoint the enquiry form posts to.
  enquiryApiUrl: env.VITE_ENQUIRY_API_URL || '/api/website-enquiry',
  offerRoute: env.VITE_OFFER_ROUTE || '/',
  // Intentionally blank by default — header/footer hide the name entirely
  // rather than showing a placeholder like "Your Business Name".
  businessName: env.VITE_BUSINESS_NAME || '',
  siteDomain: env.VITE_SITE_DOMAIN || '',
  whatsappNumber: env.VITE_WHATSAPP_NUMBER || '',
  contactEmail: env.VITE_CONTACT_EMAIL || '',
  contactPhone: env.VITE_CONTACT_PHONE || '',
  businessLocation: env.VITE_BUSINESS_LOCATION || '',
  facebookUrl: env.VITE_FACEBOOK_URL || '',
  instagramUrl: env.VITE_INSTAGRAM_URL || '',
  linkedinUrl: env.VITE_LINKEDIN_URL || '',
  portfolioUrl: env.VITE_PORTFOLIO_URL || '',
  privacyPolicyUrl: env.VITE_PRIVACY_POLICY_URL || '#',
  termsUrl: env.VITE_TERMS_URL || '#',
};
