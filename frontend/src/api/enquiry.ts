import { api } from './client';
import { config } from '../config';

export interface EnquiryPayload {
  full_name: string;
  business_name: string;
  mobile_number: string;
  whatsapp_number: string;
  email: string;
  business_category: string;
  city: string;
  business_description: string;
  required_features: string;
  existing_website_url: string;
  additional_requirements: string;
  company_website: string; // honeypot — always empty for real users
  source: string;
}

export interface EnquiryResult {
  reference_number?: string;
  message?: string;
}

export const submitEnquiry = (payload: EnquiryPayload) =>
  api.post<EnquiryResult>(config.enquiryApiUrl, payload);
