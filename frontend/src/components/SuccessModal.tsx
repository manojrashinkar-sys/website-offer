import { useEffect, useRef } from 'react';
import { trackEvent } from '../analytics';
import { config } from '../config';
import { postSubmissionMessage, whatsappLink } from '../utils/whatsapp';

interface Props {
  open: boolean;
  onClose: () => void;
  reference?: string;
  applicant: { name: string; businessName: string; category: string; city: string };
}

export default function SuccessModal({ open, onClose, reference, applicant }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const waMessage = postSubmissionMessage({
    reference,
    name: applicant.name,
    businessName: applicant.businessName,
    category: applicant.category,
    city: applicant.city,
  });

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon" aria-hidden="true">✓</div>
        <h2 id="success-modal-title">Enquiry Submitted</h2>
        <p>
          Thank you for your interest. Our team will review your business requirements
          and contact you if additional details are required.
        </p>
        {reference && (
          <div className="reference-box">
            <span>Your enquiry reference</span>
            <strong>{reference}</strong>
          </div>
        )}
        <p className="modal-note">
          Selection under the introductory programme is confirmed only after review and
          a written proposal.
        </p>
        <div className="modal-actions">
          {config.whatsappNumber && (
            <a
              className="btn btn-whatsapp"
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('promo_whatsapp_click', { placement: 'success_modal' })}
            >
              Continue on WhatsApp
            </a>
          )}
          <button ref={closeButtonRef} className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
