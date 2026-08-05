import { useEffect } from 'react';

// This is a client-rendered SPA, so per-route SEO tags have to be applied to the
// document at runtime. Everything set here is reverted on unmount, which keeps
// index.html's own tags authoritative for the offer page at "/".

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface DocumentMeta {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  og?: Record<string, string>;
  twitter?: Record<string, string>;
  structuredData?: StructuredData[];
}

type Restore = () => void;

function setNamedMeta(attr: 'name' | 'property', key: string, value: string): Restore {
  const selector = `meta[${attr}="${CSS.escape(key)}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    const previous = existing.getAttribute('content');
    existing.setAttribute('content', value);
    return () => {
      if (previous === null) existing.removeAttribute('content');
      else existing.setAttribute('content', previous);
    };
  }

  const created = document.createElement('meta');
  created.setAttribute(attr, key);
  created.setAttribute('content', value);
  document.head.appendChild(created);
  return () => created.remove();
}

function setCanonical(href: string): Restore {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (existing) {
    const previous = existing.href;
    existing.href = href;
    return () => { existing.href = previous; };
  }
  const created = document.createElement('link');
  created.rel = 'canonical';
  created.href = href;
  document.head.appendChild(created);
  return () => created.remove();
}

export function useDocumentMeta(meta: DocumentMeta) {
  const {
    title, description, canonical, keywords, og, twitter, structuredData,
  } = meta;

  // Serialised so a caller can pass fresh object literals without re-running
  // the effect on every render.
  const key = JSON.stringify(meta);

  useEffect(() => {
    const restores: Restore[] = [];

    const previousTitle = document.title;
    document.title = title;
    restores.push(() => { document.title = previousTitle; });

    restores.push(setNamedMeta('name', 'description', description));
    restores.push(setCanonical(canonical));
    if (keywords) restores.push(setNamedMeta('name', 'keywords', keywords));

    Object.entries(og ?? {}).forEach(([name, value]) => {
      restores.push(setNamedMeta('property', name, value));
    });
    Object.entries(twitter ?? {}).forEach(([name, value]) => {
      restores.push(setNamedMeta('name', name, value));
    });

    (structuredData ?? []).forEach((data) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      restores.push(() => script.remove());
    });

    return () => restores.forEach((restore) => restore());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
