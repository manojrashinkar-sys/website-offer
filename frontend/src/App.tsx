import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { config } from './config';
import BusinessWebsiteOfferPage from './pages/BusinessWebsiteOfferPage';
import DevelopmentRoadmapPage from './pages/DevelopmentRoadmapPage';
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

// INTEGRATION NOTE: when merging into the existing portal, move these
// <Route> entries into the portal's existing router instead of using this App.
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnNavigate />
      <Routes>
        <Route path={config.offerRoute} element={<BusinessWebsiteOfferPage />} />
        <Route path={config.roadmapRoute} element={<DevelopmentRoadmapPage />} />
        <Route path="/admin/website-leads" element={<AdminLeadsPage />} />
        <Route path="*" element={<Navigate to={config.offerRoute} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
