import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { technologies, type TechnologyCard } from '../../content/roadmapContent';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Icon from '../Icon';
import Reveal from '../Reveal';

const coreTech = technologies.filter((tech) => tech.group === 'core');
const advancedTech = technologies.filter((tech) => tech.group === 'advanced');

const slug = (name: string) => name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

function TechFields({ tech }: { tech: TechnologyCard }) {
  return (
    <>
      <dl className="tech-fields">
        <dt>What it does</dt>
        <dd>{tech.purpose}</dd>
        <dt>When it is required</dt>
        <dd>{tech.whenRequired}</dd>
        <dt>Suitable project type</dt>
        <dd>{tech.suitableFor}</dd>
      </dl>
      {tech.note && <p className="tech-note">{tech.note}</p>}
    </>
  );
}

// Two layouts, because these cards are the one place on the page where a
// two-up grid alone does not help: the content is three fields of prose, so
// halving the width simply doubles the line count. On a phone each technology
// becomes a compact tile that expands, full width, on tap.
function TechCard({ tech, delay }: { tech: TechnologyCard; delay: number }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const panelId = `tech-panel-${slug(tech.name)}`;

  if (!isMobile) {
    return (
      <Reveal delay={delay} className="tech-card">
        <div className="tech-card-head">
          <span className="tech-icon" aria-hidden="true">
            <Icon name={tech.icon} size={20} />
          </span>
          <h3>{tech.name}</h3>
        </div>
        <TechFields tech={tech} />
      </Reveal>
    );
  }

  return (
    <Reveal delay={delay} className={`tech-card tech-card-collapsible ${open ? 'open' : ''}`}>
      <h3 className="tech-card-heading">
        <button
          type="button"
          className="tech-card-head tech-card-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            setOpen((current) => !current);
            if (!open) trackEvent('roadmap_tech_open', { technology: tech.name });
          }}
        >
          <span className="tech-icon" aria-hidden="true">
            <Icon name={tech.icon} size={18} />
          </span>
          <span className="tech-name">{tech.name}</span>
          <span className="tech-chevron" aria-hidden="true">+</span>
        </button>
      </h3>
      <div className="tech-fields-wrap">
        <div className="tech-fields-inner" id={panelId} aria-hidden={!open}>
          <TechFields tech={tech} />
        </div>
      </div>
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
