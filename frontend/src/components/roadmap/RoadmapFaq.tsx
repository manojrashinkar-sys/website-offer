import { roadmapFaqItems } from '../../content/roadmapContent';
import FaqAccordion from '../FaqAccordion';

export default function RoadmapFaq() {
  return (
    <section className="section section-alt" id="roadmap-faq">
      <div className="container narrow">
        <div className="section-head">
          <h2>Common Questions Before Starting</h2>
          <p>Short, direct answers to the questions that come up on almost every project.</p>
        </div>
        <FaqAccordion items={roadmapFaqItems} idPrefix="roadmap-faq" defaultOpenIndex={null} searchable />
      </div>
    </section>
  );
}
