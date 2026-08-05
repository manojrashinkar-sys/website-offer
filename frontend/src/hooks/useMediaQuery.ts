import { useEffect, useState } from 'react';

// Some layout changes cannot be expressed in CSS alone — a card that collapses
// its detail on a phone but shows everything on a desktop needs different
// markup, not just different styling.
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Matches the 640px breakpoint the stylesheets use for the two-up card grid. */
export function useIsMobile() {
  return useMediaQuery('(max-width: 640px)');
}
