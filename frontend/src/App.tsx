import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { config } from './config';
import BusinessWebsiteOfferPage from './pages/BusinessWebsiteOfferPage';
import AdminLeadsPage from './pages/AdminLeadsPage';

// INTEGRATION NOTE: when merging into the existing portal, move these two
// <Route> entries into the portal's existing router instead of using this App.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={config.offerRoute} element={<BusinessWebsiteOfferPage />} />
        <Route path="/admin/website-leads" element={<AdminLeadsPage />} />
        <Route path="*" element={<Navigate to={config.offerRoute} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
