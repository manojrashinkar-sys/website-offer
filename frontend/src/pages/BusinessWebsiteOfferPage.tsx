import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { EnquiryResult } from '../api/enquiry';
import { trackEvent } from '../analytics';
import { scrollToSection } from '../utils/scroll';
import OfferHeader from '../components/OfferHeader';
import ScrollProgress from '../components/ScrollProgress';
import LivePreview from '../components/LivePreview';
import PresenceComparison from '../components/PresenceComparison';
import HeroSection from '../components/HeroSection';
import BusinessCategories from '../components/BusinessCategories';
import BusinessTypeSelector from '../components/BusinessTypeSelector';
import IncludedServices from '../components/IncludedServices';
import HowItWorks from '../components/HowItWorks';
import TrustSection from '../components/TrustSection';
import OfferSection from '../components/OfferSection';
import EnquiryForm from '../components/EnquiryForm';
import FAQSection from '../components/FAQSection';
import ClosingCta from '../components/ClosingCta';
import WhatsAppButton from '../components/WhatsAppButton';
import MobileStickyActions from '../components/MobileStickyActions';
import WebsiteAdvisor from '../components/website-advisor/WebsiteAdvisor';
import SuccessModal from '../components/SuccessModal';
import OfferFooter from '../components/OfferFooter';

export default function BusinessWebsiteOfferPage() {
  const [result, setResult] = useState<EnquiryResult | null>(null);
  const [applicant, setApplicant] = useState({ name: '', businessName: '', category: '', city: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const { state } = useLocation();

  useEffect(() => {
    trackEvent('promo_page_view');
  }, []);

  // Arriving from "Discuss Your Website" on the roadmap page: the target
  // section only exists once this page has mounted, so the scroll happens here.
  useEffect(() => {
    const target = (state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const frame = requestAnimationFrame(() => scrollToSection(target));
    return () => cancelAnimationFrame(frame);
  }, [state]);

  return (
    <div className="offer-page">
      <a className="skip-link" href="#enquiry">Skip to enquiry form</a>
      <ScrollProgress />
      <OfferHeader />
      <main>
        <HeroSection />
        <LivePreview />
        <BusinessCategories />
        <BusinessTypeSelector />
        <PresenceComparison />
        <IncludedServices />
        <HowItWorks />
        <TrustSection />
        <OfferSection />
        <EnquiryForm
          onSuccess={(enquiryResult, applicantDetails) => {
            setResult(enquiryResult);
            setApplicant(applicantDetails);
            setModalOpen(true);
          }}
        />
        <FAQSection />
        <ClosingCta />
      </main>
      <OfferFooter />
      <WhatsAppButton />
      <MobileStickyActions />
      <WebsiteAdvisor />
      <SuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reference={result?.reference_number}
        applicant={applicant}
      />
    </div>
  );
}
