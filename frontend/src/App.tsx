import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { config } from './config';
import BusinessWebsiteOfferPage from './pages/BusinessWebsiteOfferPage';
import DevelopmentRoadmapPage from './pages/DevelopmentRoadmapPage';
import AdminLeadsPage from './pages/AdminLeadsPage';
import CommunityLayout from './community/CommunityLayout';
import { onWebServicesHost } from './community/routing';
import CommunityHome from './community/pages/HomePage';
import CommunityAbout from './community/pages/AboutPage';
import CommunityServices from './community/pages/ServicesPage';
import CommunityWork from './community/pages/WorkPage';
import CommunityProcess from './community/pages/ProcessPage';
import CommunityContact from './community/pages/ContactPage';

// React Router keeps the scroll position across route changes, which lands
// visitors halfway down a page they have never seen. Navigations that ask to
// be scrolled somewhere specific (see useDiscussAction) opt out via state.
function ScrollToTopOnNavigate() {
  const { pathname, state } = useLocation();

  useEffect(() => {
    if (state && typeof state === 'object' && 'scrollTo' in state) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, state]);

  return null;
}

/**
 * The six Web Services pages, mounted under whichever path the current host
 * gives them. Declared once so the two mounts can never drift apart.
 */
function communityRoutes() {
  return (
    <>
      <Route index element={<CommunityHome />} />
      <Route path="about" element={<CommunityAbout />} />
      <Route path="services" element={<CommunityServices />} />
      <Route path="work" element={<CommunityWork />} />
      <Route path="process" element={<CommunityProcess />} />
      <Route path="contact" element={<CommunityContact />} />
    </>
  );
}

// INTEGRATION NOTE: when merging into the existing portal, move these
// <Route> entries into the portal's existing router instead of using this App.
export default function App() {
  // Read once per mount rather than per render — the hostname cannot change
  // without a full page load.
  const webServices = onWebServicesHost();

  return (
    <BrowserRouter>
      <ScrollToTopOnNavigate />
      <Routes>
        {webServices ? (
          // On the subdomain, Web Services *is* the site: it owns the root and
          // the offer page is not served here at all.
          <Route path="/" element={<CommunityLayout />}>
            {communityRoutes()}
          </Route>
        ) : (
          <>
            <Route path={config.offerRoute} element={<BusinessWebsiteOfferPage />} />
            <Route path={config.roadmapRoute} element={<DevelopmentRoadmapPage />} />
            {/* The same pages under a path, so they can be opened on preview
                deployments and on localhost. They carry noindex there, so they
                never compete with the subdomain in search results. */}
            <Route path={config.communityRoute} element={<CommunityLayout />}>
              {communityRoutes()}
            </Route>
          </>
        )}
        <Route path="/admin/website-leads" element={<AdminLeadsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
