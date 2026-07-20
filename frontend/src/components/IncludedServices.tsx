import CardGrid from './CardGrid';
import { includedServices } from '../content/pageContent';

export default function IncludedServices() {
  return (
    <section className="section section-alt" id="services">
      <div className="container">
        <div className="section-head">
          <h2>What Your Website Includes</h2>
          <p>The standard scope of a professional business profile website.</p>
        </div>
        <CardGrid items={includedServices} compact />
        <p className="section-note">
          Final features depend on the confirmed project scope. Advanced requirements are
          quoted separately.
        </p>
      </div>
    </section>
  );
}
