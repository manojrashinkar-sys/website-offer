import { useLocation, useNavigate } from 'react-router-dom';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { scrollToSection } from '../utils/scroll';

// "Discuss Your Website" is the same consultation action the offer page already
// uses — the enquiry form. From the roadmap route there is no form on the page,
// so we route back to the offer page and scroll to it once it has mounted
// (see the scroll handoff in BusinessWebsiteOfferPage).
export function useDiscussAction(placement: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    trackEvent('promo_apply_click', { placement });
    if (location.pathname === config.offerRoute) {
      scrollToSection('enquiry');
      return;
    }
    navigate(config.offerRoute, { state: { scrollTo: 'enquiry' } });
  };
}
