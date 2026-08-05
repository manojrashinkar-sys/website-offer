import { useState } from 'react';
import type { FaqItem } from '../content/pageContent';
import Reveal from './Reveal';

interface Props {
  items: FaqItem[];
  /** Keeps the generated answer ids unique when two accordions share a page. */
  idPrefix?: string;
  /** Index open on first render; pass null to start fully collapsed. */
  defaultOpenIndex?: number | null;
}

// Accessible single-open accordion. Extracted from FAQSection so the roadmap
// page can reuse exactly the same markup, styling and keyboard behaviour.
export default function FaqAccordion({ items, idPrefix = 'faq', defaultOpenIndex = 0 }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const answerId = `${idPrefix}-answer-${index}`;
        return (
          <Reveal key={item.question} delay={Math.min(index, 6) * 40} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              className="faq-question"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {item.question}
              <span className="faq-chevron" aria-hidden="true">+</span>
            </button>
            <div className="faq-answer-wrap">
              <div className="faq-answer" id={answerId} aria-hidden={!isOpen}>
                <p>{item.answer}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
