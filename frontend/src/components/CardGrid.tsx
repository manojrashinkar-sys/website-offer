import { useState } from 'react';
import type { CardItem } from '../content/pageContent';
import Reveal from './Reveal';
import Icon from './Icon';

interface Props {
  items: CardItem[];
  compact?: boolean;
}

// Shared data-driven card grid used by the categories, features and trust
// sections. Cards that carry `details` become expandable in place — the
// alternative was a paragraph of specifics on every card, which turns the
// grid into a wall of text nobody reads.
export default function CardGrid({ items, compact = false }: Props) {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    <div className={`card-grid ${compact ? 'card-grid-compact' : ''}`}>
      {items.map((item, index) => {
        const expandable = Boolean(item.details?.length);
        const isOpen = openTitle === item.title;
        const panelId = `card-detail-${index}`;

        return (
          <Reveal
            key={item.title}
            delay={(index % 6) * 70}
            className={`info-card ${expandable ? 'expandable' : ''} ${isOpen ? 'open' : ''}`}
          >
            <span className="info-card-icon" aria-hidden="true">
              <Icon name={item.icon} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>

            {expandable && (
              <>
                <button
                  type="button"
                  className="card-toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenTitle(isOpen ? null : item.title)}
                >
                  {isOpen ? 'Less' : 'What’s included'}
                  <span className="card-toggle-chevron" aria-hidden="true">+</span>
                </button>
                <div className="card-detail-wrap">
                  <div className="card-detail" id={panelId} aria-hidden={!isOpen}>
                    <ul>
                      {item.details?.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
