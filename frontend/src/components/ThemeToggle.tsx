import { trackEvent } from '../analytics';
import { useTheme } from '../hooks/useTheme';
import Icon from './Icon';

interface Props {
  /** `bar` is the compact header control; `row` is the labelled drawer row. */
  variant?: 'bar' | 'row';
}

export default function ThemeToggle({ variant = 'bar' }: Props) {
  const { resolved, toggle } = useTheme();
  const goingTo = resolved === 'dark' ? 'light' : 'dark';

  const onClick = () => {
    toggle();
    trackEvent('theme_toggled', { to: goingTo });
  };

  if (variant === 'row') {
    return (
      <button type="button" className="theme-row" onClick={onClick}>
        <span className="theme-row-label">
          <Icon name={resolved === 'dark' ? 'moon' : 'sun'} size={17} />
          {resolved === 'dark' ? 'Dark' : 'Light'} appearance
        </span>
        <span className="theme-switch" aria-hidden="true">
          <span className="theme-switch-knob" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={`Switch to ${goingTo} theme`}
      title={`Switch to ${goingTo} theme`}
    >
      {/* Both glyphs are rendered and cross-faded, so the control never
          reflows or flickers as the icon changes. */}
      <span className="theme-icon theme-icon-sun" aria-hidden="true"><Icon name="sun" size={18} /></span>
      <span className="theme-icon theme-icon-moon" aria-hidden="true"><Icon name="moon" size={18} /></span>
    </button>
  );
}
