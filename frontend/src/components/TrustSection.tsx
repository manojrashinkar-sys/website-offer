import CardGrid from './CardGrid';
import { trustPoints } from '../content/pageContent';

export default function TrustSection() {
  return (
    <section className="section" id="why-us">
      <div className="container">
        <div className="section-head">
          <h2>How This Works, Honestly</h2>
          <p>No agency layers, no automated screening — here's exactly what to expect.</p>
        </div>
        <CardGrid items={trustPoints} compact />
      </div>
    </section>
  );
}
