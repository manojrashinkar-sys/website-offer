import { checklistSecurityNote, clientChecklist } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';
import Callout from './Callout';

export default function ClientChecklist() {
  return (
    <section className="section" id="what-we-need">
      <div className="container">
        <div className="section-head">
          <h2>What We Need From You</h2>
          <p>
            The more of this you can share early, the faster the website moves. Nothing here
            has to be perfect — we can help shape rough material into finished content.
          </p>
        </div>

        <div className="checklist-grid">
          {clientChecklist.map((group, index) => (
            <Reveal key={group.title} delay={index * 60} className="checklist-card">
              <span className="info-card-icon" aria-hidden="true">
                <Icon name={group.icon} size={22} />
              </span>
              <h3>{group.title}</h3>
              <ul className="dot-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Callout tone="security">{checklistSecurityNote}</Callout>
      </div>
    </section>
  );
}
