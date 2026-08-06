import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'wo_theme';
const QUERY = '(prefers-color-scheme: dark)';

function storedChoice(): ThemeChoice {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia(QUERY).matches ? 'dark' : 'light';
}

function apply(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Light/dark theme with a system option.
 *
 * The initial attribute is set by a small inline script in index.html so the
 * correct theme is painted on the very first frame — doing it here would show
 * a light flash before React mounts.
 */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(storedChoice);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    storedChoice() === 'system' ? systemTheme() : (storedChoice() as ResolvedTheme),
  );

  useEffect(() => {
    const next: ResolvedTheme = choice === 'system' ? systemTheme() : choice;
    setResolved(next);
    apply(next);

    try {
      if (choice === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Blocked storage just means the choice won't survive a reload.
    }
  }, [choice]);

  // Follow the operating system live, but only while the visitor has not
  // expressed a preference of their own.
  useEffect(() => {
    if (choice !== 'system') return;
    const list = window.matchMedia(QUERY);
    const onChange = () => {
      const next = systemTheme();
      setResolved(next);
      apply(next);
    };
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [choice]);

  const toggle = useCallback(() => {
    setChoice(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved]);

  return { choice, resolved, setChoice, toggle };
}
