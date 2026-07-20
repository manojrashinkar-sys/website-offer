import { useState } from 'react';
import { faqItems } from '../content/pageContent';
import Reveal from './Reveal';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section" id="faq">
      <div className="container narrow">
        <div className="section-head">
          <h2>Frequently Asked Questions</h2>
          <p>Honest answers about how the programme works.</p>
        </div>
        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={item.question} delay={index * 40} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  {item.question}
                  <span className="faq-chevron" aria-hidden="true">+</span>
                </button>
                <div className="faq-answer-wrap">
                  <div className="faq-answer" id={`faq-answer-${index}`} aria-hidden={!isOpen}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
