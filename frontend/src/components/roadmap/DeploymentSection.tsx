import { deploymentFlow, deploymentPoints, deploymentSecurityNote } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';
import Callout from './Callout';
import FlowChain from './FlowChain';

export default function DeploymentSection() {
  return (
    <section className="section" id="deployment">
      <div className="container">
        <div className="section-head">
          <h2>Secure and Manageable Deployment</h2>
          <p>
            Your website is built in its own private repository and published to your own
            hosting account — nothing else is ever connected or exposed.
          </p>
        </div>

        <Reveal className="status-card deploy-card">
          <FlowChain
            nodes={deploymentFlow}
            numbered
            label="Deployment path from repository to live domain"
          />
        </Reveal>

        <Reveal className="deploy-points" delay={80}>
          <ul className="tick-list two-column">
            {deploymentPoints.map((point) => (
              <li key={point}>
                <span className="tick" aria-hidden="true">
                  <Icon name="check-circle" size={17} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Callout tone="security">{deploymentSecurityNote}</Callout>
      </div>
    </section>
  );
}
