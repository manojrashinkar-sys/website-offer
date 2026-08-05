import { architecturePrinciples } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';

export default function ArchitectureIntro() {
  return (
    <section className="section" id="overview">
      <div className="container">
        <div className="section-head">
          <h2>The Right Architecture for Every Business</h2>
          <p>
            A small business profile website does not normally require an expensive custom
            server. A complex business platform may require a backend, database, security
            controls, monitoring, and dedicated infrastructure. We select only the
            technologies that are genuinely required for the project.
          </p>
        </div>

        <div className="principle-grid">
          {architecturePrinciples.map((principle, index) => (
            <Reveal key={principle.title} delay={index * 70} className="principle-card">
              <span className="principle-icon" aria-hidden="true">
                <Icon name={principle.icon} size={20} />
              </span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
