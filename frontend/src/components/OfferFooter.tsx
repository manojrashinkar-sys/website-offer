import { Link } from 'react-router-dom';
import { config } from '../config';
import { trackEvent } from '../analytics';
import { generalEnquiryMessage, whatsappLink } from '../utils/whatsapp';
import Logo from './Logo';

const legalPoints = [
  'Domain, hosting, premium services and advanced features may be charged separately.',
  'Project scope is confirmed in writing before development starts.',
  'Maintenance after deployment is offered as a separate, optional service.',
];

export default function OfferFooter() {
  const socials = [
    { label: 'Facebook', url: config.facebookUrl },
    { label: 'Instagram', url: config.instagramUrl },
    { label: 'LinkedIn', url: config.linkedinUrl },
    { label: 'Portfolio', url: config.portfolioUrl },
  ].filter((s) => s.url);

  return (
    <footer className="offer-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-brand">
              <Logo tone="light" />
            </h3>
            <p>Professional business website design and development.</p>
            {config.businessLocation && <p>{config.businessLocation}</p>}
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer-links">
              {config.contactEmail && (
                <li><a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></li>
              )}
              {config.contactPhone && (
                <li><a href={`tel:${config.contactPhone}`}>{config.contactPhone}</a></li>
              )}
              {config.whatsappNumber && (
                <li>
                  <a href={whatsappLink(generalEnquiryMessage())} target="_blank" rel="noopener noreferrer">
                    Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <ul className="footer-links social">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4>Explore</h4>
            <ul className="footer-links">
              <li>
                <Link to={config.offerRoute}>Website Offer</Link>
              </li>
              <li>
                <Link to={config.communityRoute}>Web Services</Link>
              </li>
              <li>
                <Link
                  to={config.roadmapRoute}
                  onClick={() => trackEvent('roadmap_link_click', { placement: 'footer' })}
                >
                  Development Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href={config.privacyPolicyUrl}>Privacy Policy</a></li>
              <li><a href={config.termsUrl}>Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-terms">
          <h4>Additional Terms</h4>
          <ul>
            {legalPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} {config.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
