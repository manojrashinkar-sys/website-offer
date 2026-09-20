import { useLocation, useNavigate } from 'react-router-dom';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { scrollToSection } from '../utils/scroll';
import { communityPath, onWebServicesHost } from '../community/routing';

// "Discuss Your Website" is the same consultation action everywhere: get the
// visitor to the enquiry form and scroll it into view. Which form depends on
// which site they are on — the Web Services site has its own, on its Contact
// page, and sending them to the offer page's form would be sending them to a
// different business.
//
// This was broken on the Web Services site: the action navigated to
// config.offerRoute, which is '/', and on that subdomain '/' is the Web
// Services home page, which has no #enquiry on it. So every "Discuss a
// Project" button — the header, the drawer, and the closing call to action on
// five pages — either did nothing at all or dumped the visitor back on the
// home page. The site's primary action did not work.
export function useDiscussAction(placement: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    trackEvent('promo_apply_click', { placement });

    // The subdomain always; the /community/* copies too, so previewing them
    // behaves the same way the real site does.
    const inCommunity = onWebServicesHost()
      || location.pathname === config.communityRoute
      || location.pathname.startsWith(`${config.communityRoute}/`);

    const target = inCommunity ? communityPath('contact') : config.offerRoute;

    if (location.pathname === target) {
      scrollToSection('enquiry');
      return;
    }
    navigate(target, { state: { scrollTo: 'enquiry' } });
  };
}
