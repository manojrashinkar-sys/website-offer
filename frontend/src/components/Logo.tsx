import { config } from '../config';

interface Props {
  /** `light` is for the dark footer; `dark` for the white header. */
  tone?: 'dark' | 'light';
}

// Typographic wordmark. It replaced an abstract gradient monogram that, with no
// business name beside it, read as a stray icon rather than a brand — a poor
// first impression on what is a landing page for new clients.
//
// The last word takes the brand gradient; everything before it stays in ink.
export default function Logo({ tone = 'dark' }: Props) {
  const parts = config.brandName.trim().split(/\s+/).filter(Boolean);
  const accent = parts.length > 1 ? parts[parts.length - 1] : '';
  const lead = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] ?? '';

  return (
    <span className={`wordmark wordmark-${tone}`}>
      <span className="wordmark-lead">{lead}</span>
      {accent && <span className="wordmark-accent">{accent}</span>}
    </span>
  );
}
