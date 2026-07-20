// Client-side validation helpers. The backend re-validates everything.

const INDIAN_MOBILE = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL = /^https?:\/\/[^\s<>"]+$/i;

export const isValidIndianMobile = (value: string) =>
  INDIAN_MOBILE.test(value.trim().replace(/\s/g, ''));

export const isValidEmail = (value: string) => EMAIL.test(value.trim());

export const isValidUrl = (value: string) => URL.test(value.trim());

export const normaliseMobile = (value: string) =>
  value.trim().replace(/\s|-/g, '').replace(/^\+?91/, '');
