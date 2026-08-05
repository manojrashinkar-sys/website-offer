import { Link } from 'react-router-dom';
import { howItWorksSteps } from '../content/pageContent';
import { config } from '../config';
import { trackEvent } from '../analytics';
import Reveal from './Reveal';

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <h2>How It Works</h2>
          <p>A clear, transparent process from enquiry to launch.</p>
        </div>
        <ol className="steps">
          {howItWorksSteps.map((step, index) => (
            <Reveal key={step.title} as="li" delay={index * 80} className="step">
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <div className="section-cta">
          <Link
            className="btn btn-outline"
            to={config.roadmapRoute}
            onClick={() => trackEvent('roadmap_link_click', { placement: 'how_it_works' })}
          >
            View Development Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
