import { faqItems } from '../content/pageContent';
import FaqAccordion from './FaqAccordion';

export default function FAQSection() {
  return (
    <section className="section" id="faq">
      <div className="container narrow">
        <div className="section-head">
          <h2>Frequently Asked Questions</h2>
          <p>Honest answers about how the programme works.</p>
        </div>
        <FaqAccordion items={faqItems} idPrefix="faq" />
      </div>
    </section>
  );
}
