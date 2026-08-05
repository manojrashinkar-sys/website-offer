import type { ReactNode } from 'react';
import Icon from '../Icon';

interface Props {
  children: ReactNode;
  tone?: 'info' | 'security';
  icon?: string;
}

// Highlighted note block. `security` is used for the two access-control
// warnings, which need to read as cautions rather than tips.
export default function Callout({ children, tone = 'info', icon }: Props) {
  const glyph = icon ?? (tone === 'security' ? 'alert-triangle' : 'check-circle');
  return (
    <div className={`callout callout-${tone}`}>
      <span className="callout-icon" aria-hidden="true">
        <Icon name={glyph} size={20} />
      </span>
      <p>{children}</p>
    </div>
  );
}
