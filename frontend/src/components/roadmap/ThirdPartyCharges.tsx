import { thirdPartyCharges, thirdPartyStatements } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';
import TagList from './TagList';

export default function ThirdPartyCharges() {
  return (
    <section className="section" id="third-party">
      <div className="container">
        <div className="section-head">
          <h2>Charges Outside Website Development</h2>
          <p>
            Some services are bought from other companies. These are listed separately so
            there are no surprises later.
          </p>
        </div>

        <Reveal className="status-card charges-card">
          <TagList items={thirdPartyCharges} label="Third-party and recurring charges" />
        </Reveal>

        <div className="statement-grid">
          {thirdPartyStatements.map((statement, index) => (
            <Reveal key={statement} delay={index * 70} className="statement-card">
              <span className="statement-icon" aria-hidden="true">
                <Icon name="credit-card" size={20} />
              </span>
              <p>{statement}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
