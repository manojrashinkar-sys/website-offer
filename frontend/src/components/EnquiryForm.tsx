import { useRef, useState } from 'react';
import { submitEnquiry, type EnquiryResult } from '../api/enquiry';
import type { ApiError } from '../api/client';
import { trackEvent } from '../analytics';
import { config } from '../config';
import { categoryOptions } from '../content/pageContent';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import { isValidEmail, isValidIndianMobile, isValidUrl, normaliseMobile } from '../utils/validation';

interface Props {
  onSuccess: (
    result: EnquiryResult,
    applicant: { name: string; businessName: string; category: string; city: string },
  ) => void;
}

const initialForm = {
  full_name: '',
  business_name: '',
  mobile_number: '',
  whatsapp_number: '',
  email: '',
  business_category: '',
  city: '',
  business_description: '',
  required_features: '',
  existing_website_url: '',
  additional_requirements: '',
  company_website: '', // honeypot — hidden from real users
};

type FormData = typeof initialForm;
type Errors = Partial<Record<keyof FormData, string>>;

export default function EnquiryForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [differentWhatsapp, setDifferentWhatsapp] = useState(false);
  const startedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  const setField = (name: keyof FormData, value: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent('promo_form_started');
    }
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.full_name.trim()) e.full_name = 'Please enter your full name.';
    if (!form.business_name.trim()) e.business_name = 'Please enter your business name.';
    if (!isValidIndianMobile(form.mobile_number)) e.mobile_number = 'Enter a valid 10-digit Indian mobile number.';
    if (differentWhatsapp && !isValidIndianMobile(form.whatsapp_number)) {
      e.whatsapp_number = 'Enter a valid 10-digit WhatsApp number.';
    }
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.business_category) e.business_category = 'Please select your business category.';
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (form.business_description.trim().length < 20) {
      e.business_description = 'Please describe your business in at least 20 characters.';
    }
    if (form.existing_website_url.trim() && !isValidUrl(form.existing_website_url)) {
      e.existing_website_url = 'Enter a valid URL starting with http:// or https://';
    }
    return e;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return; // guard against double submission
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      sectionRef.current?.querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitEnquiry({
        ...form,
        mobile_number: normaliseMobile(form.mobile_number),
        whatsapp_number: normaliseMobile(differentWhatsapp ? form.whatsapp_number : form.mobile_number),
        source: 'promo_page',
      });
      trackEvent('promo_form_submitted');
      onSuccess(result || {}, {
        name: form.full_name,
        businessName: form.business_name,
        category: form.business_category,
        city: form.city,
      });
      setForm(initialForm);
      setDifferentWhatsapp(false);
      startedRef.current = false;
    } catch (err) {
      const apiError = err as ApiError;
      trackEvent('promo_form_submission_failed', { status: apiError.status ?? 0 });
      if (apiError.fieldErrors) setErrors(apiError.fieldErrors as Errors);
      setServerError(apiError.message || 'Submission failed. Please try again.');
      // Entered data is intentionally preserved so the user can correct and resubmit.
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    name: keyof FormData,
    label: string,
    options: { type?: string; required?: boolean; placeholder?: string; textarea?: boolean; hint?: string } = {},
  ) => (
    <div className={`form-field ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={`enq-${name}`}>
        {label}
        {options.required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {options.textarea ? (
        <textarea
          id={`enq-${name}`}
          value={form[name]}
          placeholder={options.placeholder}
          rows={3}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `enq-${name}-error` : undefined}
          onChange={(e) => setField(name, e.target.value)}
        />
      ) : (
        <input
          id={`enq-${name}`}
          type={options.type || 'text'}
          value={form[name]}
          placeholder={options.placeholder}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `enq-${name}-error` : undefined}
          onChange={(e) => setField(name, e.target.value)}
        />
      )}
      {options.hint && !errors[name] && <span className="field-hint">{options.hint}</span>}
      {errors[name] && (
        <span className="field-error" id={`enq-${name}-error`} role="alert">{errors[name]}</span>
      )}
    </div>
  );

  return (
    <section className="section section-alt" id="enquiry" ref={sectionRef}>
      <div className="container narrow">
        <div className="section-head">
          <h2>Apply for Your Business Website</h2>
          <p>
            Share your business details below. Every enquiry is reviewed personally, and
            we'll contact you to discuss the next steps.
            {config.whatsappNumber && (
              <>
                {' '}Prefer not to fill a form?{' '}
                <a
                  href={whatsappLink(generalEnquiryMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('promo_whatsapp_click', { placement: 'form_alt' })}
                >
                  Chat with us on WhatsApp instead
                </a>
                .
              </>
            )}
          </p>
        </div>

        <form className="application-form" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend>Your Details</legend>
            <div className="form-row">
              {field('full_name', 'Full name', { required: true, placeholder: 'Your name' })}
              {field('business_name', 'Business name', { required: true })}
            </div>
            <div className="form-row">
              {field('mobile_number', 'Mobile number', { required: true, type: 'tel', placeholder: '10-digit mobile number', hint: 'Also used for WhatsApp, unless you specify a different number below.' })}
              {field('email', 'Email address', { required: true, type: 'email' })}
            </div>

            {!differentWhatsapp ? (
              <button
                type="button"
                className="link-toggle"
                onClick={() => setDifferentWhatsapp(true)}
              >
                + My WhatsApp number is different
              </button>
            ) : (
              <div className="form-field">
                <label htmlFor="enq-whatsapp_number">
                  WhatsApp number<span className="req" aria-hidden="true"> *</span>
                </label>
                <input
                  id="enq-whatsapp_number"
                  type="tel"
                  value={form.whatsapp_number}
                  placeholder="10-digit WhatsApp number"
                  aria-invalid={!!errors.whatsapp_number}
                  onChange={(e) => setField('whatsapp_number', e.target.value)}
                />
                {errors.whatsapp_number && (
                  <span className="field-error" role="alert">{errors.whatsapp_number}</span>
                )}
              </div>
            )}

            <div className="form-row">
              <div className={`form-field ${errors.business_category ? 'has-error' : ''}`}>
                <label htmlFor="enq-business_category">
                  Business category<span className="req" aria-hidden="true"> *</span>
                </label>
                <select
                  id="enq-business_category"
                  value={form.business_category}
                  aria-invalid={!!errors.business_category}
                  onChange={(e) => setField('business_category', e.target.value)}
                >
                  <option value="">Select…</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {errors.business_category && (
                  <span className="field-error" role="alert">{errors.business_category}</span>
                )}
              </div>
              {field('city', 'City', { required: true })}
            </div>
          </fieldset>

          <fieldset>
            <legend>Your Website</legend>
            {field('business_description', 'Business description', { required: true, textarea: true, placeholder: 'What does your business do? Who are your customers?' })}
            {field('required_features', 'Required website features', { textarea: true, placeholder: 'e.g. photo gallery, enquiry form, Google Maps, appointment booking' })}
            {field('existing_website_url', 'Existing website URL (if any)', { type: 'url', placeholder: 'https://…' })}
            {field('additional_requirements', 'Additional requirements', { textarea: true, placeholder: 'Anything else we should know?' })}
          </fieldset>

          {/* Honeypot — hidden from humans, bots tend to fill it. */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="enq-company_website">Company website</label>
            <input
              id="enq-company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.company_website}
              onChange={(e) => setForm((f) => ({ ...f, company_website: e.target.value }))}
            />
          </div>

          {serverError && (
            <div className="form-server-error" role="alert">{serverError}</div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-glow" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Enquiry'}
          </button>
          {submitting && (
            <p className="field-hint submit-wait-note">
              This can take up to a minute on the first request of the day — please don't close this page.
            </p>
          )}
          <p className="section-note">
            Applications are reviewed individually and submitting one does not guarantee
            selection — see programme terms above.
          </p>
        </form>
      </div>
    </section>
  );
}
