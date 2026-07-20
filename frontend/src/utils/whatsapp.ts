import { config } from '../config';

// Builds wa.me click-to-chat links with a correctly URL-encoded message.
// Only information the visitor themselves typed is ever placed in the URL.

export function whatsappLink(message: string): string {
  const number = config.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function generalEnquiryMessage(): string {
  return (
    'Hello, I visited your website-development offer page and want to ' +
    'discuss a website for my business.'
  );
}

export function postSubmissionMessage(details: {
  reference?: string;
  name: string;
  businessName: string;
  category: string;
  city: string;
}): string {
  const lines = ['Hello, I submitted a website-development enquiry.', ''];
  if (details.reference) lines.push(`Enquiry Reference: ${details.reference}`);
  lines.push(
    `Name: ${details.name}`,
    `Business: ${details.businessName}`,
    `Category: ${details.category}`,
    `City: ${details.city}`,
    '',
    'I would like to discuss the next steps.',
  );
  return lines.join('\n');
}
