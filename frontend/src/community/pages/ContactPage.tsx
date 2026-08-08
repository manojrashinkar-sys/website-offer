import { useEffect, useState } from 'react';
import { config } from '../../config';
import { trackEvent } from '../../analytics';
import { contactExpect, contactHelpful } from '../../content/communityContent';
import type { EnquiryResult } from '../../api/enquiry';
import { attributionSummary } from '../../utils/attribution';
import { whatsappLink } from '../../utils/whatsapp';
import { useCommunityMeta } from '../useCommunityMeta';
import PageHero from '../PageHero';
import Icon from '../../components/Icon';
import Reveal from '../../components/Reveal';
import EnquiryForm from '../../components/EnquiryForm';
import SuccessModal from '../../components/SuccessModal';

type Applicant = { name: string; businessName: string; category: string; city: string };

/** Opening message for someone arriving from this page specifically. */
function whatsappIntro(): string {
  const lines = [
    'Hello, I found you through the Web Services site and would like to discuss a project.',
    '',
    'Business:',
    'What I need:',
  ];
  const utm = attributionSummary();
  if (utm) lines.push('', utm);
  return lines.join('\n');
}

export default function ContactPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<EnquiryResult | null>(null);
  // Starts blank rather than null: SuccessModal always reads these fields, and
  // an empty string renders as nothing while null would throw.
  const [applicant, setApplicant] = useState<Applicant>(
    { name: '', businessName: '', category: '', city: '' },
  );

  useCommunityMeta('contact');
  useEffect(() => { trackEvent('community_page_view', { page: 'contact' }); }, []);

  return (
    <>
      <PageHero
        page="contact"
        eyebrow="Contact"
        actions={
          <>
            {config.whatsappNumber && (
              <a
                className="btn btn-whatsapp btn-lg"
                href={whatsappLink(whatsappIntro())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('promo_whatsapp_click', { placement: 'community_contact_hero' })}
              >
                Message on WhatsApp
              </a>
            )}
            {config.contactPhone && (
              <a
                className="btn btn-outline btn-lg"
                href={`tel:${config.contactPhone}`}
                onClick={() => trackEvent('phone_click', { placement: 'community_contact_hero' })}
              >
                Call
              </a>
            )}
          </>
        }
      />

      {/* ---------- Expectations ---------- */}
      <section className="section">
        <div className="container community-split">
          <Reveal>
            <div>
              <div className="section-head section-head-left">
                <h2>What to expect</h2>
              </div>
              <ul className="tick-list">
                {contactExpect.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <aside className="community-aside">
              <h3>Useful to include</h3>
              <p>None of this is required — it just saves a round of questions.</p>
              <ul className="dot-list">
                {contactHelpful.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ---------- Direct routes ---------- */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Reach us directly</h2>
              <p>Whichever is easiest. All three reach the same person.</p>
            </div>
          </Reveal>

          <div className="contact-route-grid">
            {config.whatsappNumber && (
              <Reveal>
                <a
                  className="contact-route"
                  href={whatsappLink(whatsappIntro())}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('promo_whatsapp_click', { placement: 'community_contact' })}
                >
                  <span className="contact-route-icon"><Icon name="chat" size={24} /></span>
                  <strong>WhatsApp</strong>
                  <small>Usually the quickest reply</small>
                </a>
              </Reveal>
            )}
            {config.contactPhone && (
              <Reveal delay={70}>
                <a
                  className="contact-route"
                  href={`tel:${config.contactPhone}`}
                  onClick={() => trackEvent('phone_click', { placement: 'community_contact' })}
                >
                  <span className="contact-route-icon"><Icon name="phone" size={24} /></span>
                  <strong>Call</strong>
                  <small>{config.contactPhone}</small>
                </a>
              </Reveal>
            )}
            {config.contactEmail && (
              <Reveal delay={140}>
                <a className="contact-route" href={`mailto:${config.contactEmail}`}>
                  <span className="contact-route-icon"><Icon name="mail" size={24} /></span>
                  <strong>Email</strong>
                  <small>{config.contactEmail}</small>
                </a>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Form ---------- */}
      <EnquiryForm
        onSuccess={(enquiryResult, applicantDetails) => {
          setResult(enquiryResult);
          setApplicant(applicantDetails);
          setModalOpen(true);
        }}
      />

      <SuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reference={result?.reference_number}
        applicant={applicant}
      />
    </>
  );
}
