import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import ParticleRibbon from './ParticleRibbon';

// Local experiment: set false to restore the approved hero / CTA version.
const SITE_WIDE_PARTICLES = true;

export default function SiteParticlePreview() {
  const { pathname, search } = useLocation();
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const enabled = SITE_WIDE_PARTICLES && new URLSearchParams(search).get('particles') !== 'hero';

  useEffect(() => {
    if (!enabled) { setHosts([]); return; }
    // Portals put decoration below each section's existing content, even when
    // sections have opaque theme backgrounds. No wrappers or layout changes.
    const sections = Array.from(document.querySelectorAll<HTMLElement>(
      '.community-site main .section, .community-site .community-footer',
    )).filter(host => !host.parentElement?.closest('.section'));
    sections.forEach(host => host.setAttribute('data-particle-preview', ''));
    setHosts(sections);
    return () => sections.forEach(host => host.removeAttribute('data-particle-preview'));
  }, [pathname, enabled]);

  if (!enabled) return null;
  return <>{hosts.map((host, i) => createPortal(
    <ParticleRibbon intensity="background" surface={host.classList.contains('community-footer') ? 'dark' : 'theme'} />,
    host, `${pathname}-${i}`,
  ))}</>;
}
