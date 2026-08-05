import { optionalDeliverables, standardDeliverables } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';

export default function DeliverablesSection() {
  return (
    <section className="section section-alt" id="deliverables">
      <div className="container">
        <div className="section-head">
          <h2>What You Receive</h2>
          <p>The standard scope of a business website delivery, start to finish.</p>
        </div>

        <Reveal className="deliverables-card">
          <h3>Included in a business website delivery</h3>
          <ul className="tick-list three-column">
            {standardDeliverables.map((item) => (
              <li key={item}>
                <span className="tick" aria-hidden="true">
                  <Icon name="check-circle" size={17} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="deliverables-card optional" delay={80}>
          <h3>Optional, for advanced projects</h3>
          <p className="deliverables-note">
            Quoted separately once the requirement is confirmed.
          </p>
          <ul className="tick-list three-column">
            {optionalDeliverables.map((item) => (
              <li key={item}>
                <span className="tick" aria-hidden="true">
                  <Icon name="package" size={17} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
