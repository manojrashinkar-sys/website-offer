import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { technologies, type TechnologyCard } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';

const coreTech = technologies.filter((tech) => tech.group === 'core');
const advancedTech = technologies.filter((tech) => tech.group === 'advanced');

function TechCard({ tech, delay }: { tech: TechnologyCard; delay: number }) {
  return (
    <Reveal delay={delay} className="tech-card">
      <div className="tech-card-head">
        <span className="tech-icon" aria-hidden="true">
          <Icon name={tech.icon} size={20} />
        </span>
        <h3>{tech.name}</h3>
      </div>
      <dl className="tech-fields">
        <dt>What it does</dt>
        <dd>{tech.purpose}</dd>
        <dt>When it is required</dt>
        <dd>{tech.whenRequired}</dd>
        <dt>Suitable project type</dt>
        <dd>{tech.suitableFor}</dd>
      </dl>
      {tech.note && <p className="tech-note">{tech.note}</p>}
    </Reveal>
  );
}

// Business-profile technologies lead; the server-side stack is collapsed by
// default so the section does not imply every website needs a database and a VPS.
export default function TechnologySection() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <section className="section" id="technologies">
      <div className="container">
        <div className="section-head">
          <h2>Technologies Selected for the Right Purpose</h2>
          <p>
            Each technology below is used for a specific reason. Most business profile
            websites only need the first group.
          </p>
        </div>

        <h3 className="tech-group-title">Used on most business websites</h3>
        <div className="tech-grid">
          {coreTech.map((tech, index) => (
            <TechCard key={tech.name} tech={tech} delay={(index % 3) * 70} />
          ))}
        </div>

        <div className="tech-advanced">
          <button
            type="button"
            className="disclosure-toggle"
            aria-expanded={showAdvanced}
            aria-controls="advanced-tech-group"
            onClick={() => {
              setShowAdvanced((open) => !open);
              if (!showAdvanced) trackEvent('roadmap_advanced_tech_open');
            }}
          >
            <span>
              {showAdvanced ? 'Hide' : 'Show'} advanced application technologies
              <small>Backend, database, server and infrastructure — {advancedTech.length} technologies</small>
            </span>
            <span className="disclosure-chevron" aria-hidden="true">+</span>
          </button>

          {showAdvanced && (
            <div className="tech-grid" id="advanced-tech-group">
              {advancedTech.map((tech, index) => (
                <TechCard key={tech.name} tech={tech} delay={(index % 3) * 70} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
