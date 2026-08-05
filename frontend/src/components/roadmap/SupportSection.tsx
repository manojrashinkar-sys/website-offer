import { supportTiers } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';

export default function SupportSection() {
  return (
    <section className="section" id="support">
      <div className="container">
        <div className="section-head">
          <h2>Support After Launch</h2>
          <p>
            Maintenance is optional and separately agreed. Choose the level that matches how
            often your website actually changes.
          </p>
        </div>

        <div className="support-grid">
          {supportTiers.map((tier, index) => (
            <Reveal key={tier.title} delay={index * 70} className="support-card">
              <span className="info-card-icon" aria-hidden="true">
                <Icon name={tier.icon} size={22} />
              </span>
              <h3>{tier.title}</h3>
              <div className="support-labels">
                {tier.labels.map((label) => (
                  <span className="label-chip" key={label}>{label}</span>
                ))}
              </div>
              <ul className="dot-list">
                {tier.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
