import CardGrid from './CardGrid';
import { businessCategories } from '../content/pageContent';

export default function BusinessCategories() {
  return (
    <section className="section" id="who-for">
      <div className="container">
        <div className="section-head">
          <h2>Who This Service Is For</h2>
          <p>
            Built for professionals and businesses that want a credible, enquiry-ready
            online presence.
          </p>
        </div>
        <CardGrid items={businessCategories} compact />
      </div>
    </section>
  );
}
