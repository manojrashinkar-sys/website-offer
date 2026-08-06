import { useEffect } from 'react';
import { trackEvent } from '../analytics';
import { config } from '../config';
import { roadmapFaqItems } from '../content/roadmapContent';
import { useDocumentMeta, type StructuredData } from '../hooks/useDocumentMeta';
import OfferHeader from '../components/OfferHeader';
import ScrollProgress from '../components/ScrollProgress';
import OfferFooter from '../components/OfferFooter';
import WhatsAppButton from '../components/WhatsAppButton';
import MobileStickyActions from '../components/MobileStickyActions';
import RoadmapHero from '../components/roadmap/RoadmapHero';
import RoadmapSectionNav from '../components/roadmap/RoadmapSectionNav';
import ArchitectureIntro from '../components/roadmap/ArchitectureIntro';
import SolutionSelector from '../components/roadmap/SolutionSelector';
import ArchitectureComparison from '../components/roadmap/ArchitectureComparison';
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline';
import ClientChecklist from '../components/roadmap/ClientChecklist';
import OwnershipSection from '../components/roadmap/OwnershipSection';
import DeploymentSection from '../components/roadmap/DeploymentSection';
import TechnologySection from '../components/roadmap/TechnologySection';
import HostingSection from '../components/roadmap/HostingSection';
import PricingApproach from '../components/roadmap/PricingApproach';
import ComplimentaryOffer from '../components/roadmap/ComplimentaryOffer';
import ThirdPartyCharges from '../components/roadmap/ThirdPartyCharges';
import DeliverablesSection from '../components/roadmap/DeliverablesSection';
import SupportSection from '../components/roadmap/SupportSection';
import RoadmapFaq from '../components/roadmap/RoadmapFaq';
import RoadmapCta from '../components/roadmap/RoadmapCta';
import BackToTop from '../components/roadmap/BackToTop';

const PAGE_TITLE = 'Website Development Roadmap | Manoj Rashinkar';
const PAGE_DESCRIPTION =
  'Explore the complete website development roadmap, including planning, design, Next.js development, domain and DNS setup, Vercel deployment, custom server options, testing, launch, and support.';
const PAGE_URL = `${config.siteUrl}${config.roadmapRoute}`;

const structuredData: StructuredData[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Website Development Roadmap',
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    inLanguage: 'en',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Website Offer', item: `${config.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Development Roadmap', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: roadmapFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function DevelopmentRoadmapPage() {
  useDocumentMeta({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    canonical: PAGE_URL,
    keywords:
      'website development roadmap, business website development, Next.js website development, domain and hosting setup, Vercel deployment, website development process, custom web application development, website developer India',
    og: {
      'og:type': 'website',
      'og:title': 'Website Development Roadmap',
      'og:description': PAGE_DESCRIPTION,
      'og:url': PAGE_URL,
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': 'Website Development Roadmap',
      'twitter:description': PAGE_DESCRIPTION,
    },
    structuredData,
  });

  useEffect(() => {
    trackEvent('roadmap_page_view');
  }, []);

  return (
    <div className="offer-page roadmap-page">
      <a className="skip-link" href="#overview">Skip to roadmap content</a>
      <ScrollProgress />
      <OfferHeader />
      <RoadmapHero />
      <RoadmapSectionNav />
      <main>
        <ArchitectureIntro />
        <SolutionSelector />
        <ArchitectureComparison />
        <RoadmapTimeline />
        <ClientChecklist />
        <OwnershipSection />
        <DeploymentSection />
        <TechnologySection />
        <HostingSection />
        <PricingApproach />
        <ComplimentaryOffer />
        <ThirdPartyCharges />
        <DeliverablesSection />
        <SupportSection />
        <RoadmapFaq />
        <RoadmapCta />
      </main>
      <OfferFooter />
      <WhatsAppButton />
      <MobileStickyActions />
      <BackToTop />
    </div>
  );
}
