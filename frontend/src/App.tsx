import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { config } from './config';
import BusinessWebsiteOfferPage from './pages/BusinessWebsiteOfferPage';
import DevelopmentRoadmapPage from './pages/DevelopmentRoadmapPage';
import CommunityPage from './pages/CommunityPage';
import AdminLeadsPage from './pages/AdminLeadsPage';

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

/** True when the page is being served from the Web Services subdomain. */
function onWebServicesHost(): boolean {
  return window.location.hostname === config.webServicesHost;
}

// INTEGRATION NOTE: when merging into the existing portal, move these
// <Route> entries into the portal's existing router instead of using this App.
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnNavigate />
      <Routes>
        {/* On the Web Services subdomain the community page is the site, so it
            takes the root. Everywhere else the offer page keeps it and the
            community page lives at its own path. */}
        <Route
          path={config.offerRoute}
          element={onWebServicesHost() ? <CommunityPage /> : <BusinessWebsiteOfferPage />}
        />
        <Route path={config.communityRoute} element={<CommunityPage />} />
        <Route path={config.roadmapRoute} element={<DevelopmentRoadmapPage />} />
        <Route path="/admin/website-leads" element={<AdminLeadsPage />} />
        <Route path="*" element={<Navigate to={config.offerRoute} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
