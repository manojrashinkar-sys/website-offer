import type { ElementType, ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}

// Thin wrapper that fades its children up into place on scroll. Used to give
// the card grids, steps and FAQ a bit of life without a dedicated animation
// library — plain IntersectionObserver + CSS transition.
export default function Reveal({ children, delay = 0, className = '', as = 'div' }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
