/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENQUIRY_API_URL: string;
  readonly VITE_WHATSAPP_NUMBER: string;
  readonly VITE_BUSINESS_NAME: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_CONTACT_PHONE: string;
  readonly VITE_BUSINESS_LOCATION: string;
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_INSTAGRAM_URL: string;
  readonly VITE_LINKEDIN_URL: string;
  readonly VITE_PORTFOLIO_URL: string;
  readonly VITE_PRIVACY_POLICY_URL: string;
  readonly VITE_TERMS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
