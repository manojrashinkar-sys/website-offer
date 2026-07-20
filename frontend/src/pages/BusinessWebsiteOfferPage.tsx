import { useEffect, useState } from 'react';
import type { EnquiryResult } from '../api/enquiry';
import { trackEvent } from '../analytics';
import OfferHeader from '../components/OfferHeader';
import HeroSection from '../components/HeroSection';
import OfferSection from '../components/OfferSection';
import IncludedServices from '../components/IncludedServices';
import BusinessCategories from '../components/BusinessCategories';
import HowItWorks from '../components/HowItWorks';
import EnquiryForm from '../components/EnquiryForm';
import FAQSection from '../components/FAQSection';
import WhatsAppButton from '../components/WhatsAppButton';
import SuccessModal from '../components/SuccessModal';
import OfferFooter from '../components/OfferFooter';

export default function BusinessWebsiteOfferPage() {
  const [result, setResult] = useState<EnquiryResult | null>(null);
  const [applicant, setApplicant] = useState({ name: '', businessName: '', category: '', city: '' });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    trackEvent('promo_page_view');
  }, []);

  return (
    <div className="offer-page">
      <a className="skip-link" href="#enquiry">Skip to enquiry form</a>
      <OfferHeader />
      <main>
        <HeroSection />
        <OfferSection />
        <IncludedServices />
        <BusinessCategories />
        <HowItWorks />
        <EnquiryForm
          onSuccess={(enquiryResult, applicantDetails) => {
            setResult(enquiryResult);
            setApplicant(applicantDetails);
            setModalOpen(true);
          }}
        />
        <FAQSection />
      </main>
      <OfferFooter />
      <WhatsAppButton />
      <SuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reference={result?.reference_number}
        applicant={applicant}
      />
    </div>
  );
}
