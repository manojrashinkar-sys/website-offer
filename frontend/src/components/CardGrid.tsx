import type { CardItem } from '../content/pageContent';
import Reveal from './Reveal';

interface Props {
  items: CardItem[];
  compact?: boolean;
}

// Shared data-driven card grid used by the categories, features and add-on sections.
export default function CardGrid({ items, compact = false }: Props) {
  return (
    <div className={`card-grid ${compact ? 'card-grid-compact' : ''}`}>
      {items.map((item, index) => (
        <Reveal key={item.title} delay={(index % 6) * 70} className="info-card">
          <span className="info-card-icon" aria-hidden="true">{item.icon}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </Reveal>
      ))}
    </div>
  );
}
