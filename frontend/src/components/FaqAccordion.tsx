import { useMemo, useState } from 'react';
import type { FaqItem } from '../content/pageContent';
import Reveal from './Reveal';
import Icon from './Icon';

interface Props {
  items: FaqItem[];
  /** Keeps the generated answer ids unique when two accordions share a page. */
  idPrefix?: string;
  /** Index open on first render; pass null to start fully collapsed. */
  defaultOpenIndex?: number | null;
  /** Adds a filter box — worth it once a list runs past a dozen questions. */
  searchable?: boolean;
}

// Accessible single-open accordion. Extracted from FAQSection so the roadmap
// page can reuse exactly the same markup, styling and keyboard behaviour.
export default function FaqAccordion({
  items, idPrefix = 'faq', defaultOpenIndex = 0, searchable = false,
}: Props) {
  const [openKey, setOpenKey] = useState<string | null>(
    defaultOpenIndex === null ? null : (items[defaultOpenIndex]?.question ?? null),
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term),
    );
  }, [items, query]);

  return (
    <>
      {searchable && (
        <div className="faq-search">
          <label className="sr-only" htmlFor={`${idPrefix}-search`}>Search questions</label>
          <span className="faq-search-icon" aria-hidden="true"><Icon name="search" size={17} /></span>
          <input
            id={`${idPrefix}-search`}
            type="search"
            value={query}
            placeholder={`Search ${items.length} questions — try “domain” or “hosting”`}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" className="faq-search-clear" onClick={() => setQuery('')}>
              Clear
            </button>
          )}
          <p className="faq-search-count" aria-live="polite">
            {query
              ? `${filtered.length} of ${items.length} question${filtered.length === 1 ? '' : 's'}`
              : `${items.length} questions`}
          </p>
        </div>
      )}

      <div className="faq-list">
        {filtered.map((item, index) => {
          const isOpen = openKey === item.question;
          // Keyed on the question rather than the index, so filtering the list
          // cannot leave a different answer expanded than the one clicked.
          const answerId = `${idPrefix}-answer-${index}`;
          return (
            <Reveal
              key={item.question}
              delay={Math.min(index, 6) * 40}
              className={`faq-item ${isOpen ? 'open' : ''}`}
            >
              <button
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenKey(isOpen ? null : item.question)}
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

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No question matches “{query}”.</p>
            <p>Ask us directly on WhatsApp and we will answer it.</p>
          </div>
        )}
      </div>
    </>
  );
}
