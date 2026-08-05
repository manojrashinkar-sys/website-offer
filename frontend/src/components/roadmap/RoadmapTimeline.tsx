import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { roadmapPhases } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';

// Who leads the phase, for badge colour only. A label that starts with
// "Developer" is developer-led even when it mentions client authorisation.
function responsibilityTone(responsibility: string) {
  if (responsibility.startsWith('Developer')) return 'developer';
  if (responsibility.startsWith('Client') && responsibility.includes('Developer')) return 'shared';
  if (responsibility === 'Both') return 'shared';
  return 'client';
}

// Six phases instead of a flat list of forty-odd tasks. The task detail is
// collapsed behind a disclosure per phase, so the section stays scannable but
// nothing is hidden from someone who wants the full picture.
export default function RoadmapTimeline() {
  const [openPhase, setOpenPhase] = useState<string | null>(roadmapPhases[0].id);

  return (
    <section className="section section-alt" id="process">
      <div className="container">
        <div className="section-head">
          <h2>How Your Website Is Delivered</h2>
          <p>
            A structured development process keeps responsibilities, timelines, approvals,
            and technical decisions clear.
          </p>
        </div>

        <ol className="phase-list">
          {roadmapPhases.map((phase, index) => {
            const isOpen = openPhase === phase.id;
            const panelId = `phase-tasks-${phase.id}`;
            return (
              <Reveal
                as="li"
                key={phase.id}
                delay={index * 60}
                className={`phase-card ${isOpen ? 'open' : ''}`}
              >
                <div className="phase-marker" aria-hidden="true">
                  <span className="phase-icon"><Icon name={phase.icon} size={22} /></span>
                  <span className="phase-rail" />
                </div>

                <div className="phase-body">
                  <p className="phase-eyebrow">Phase {index + 1}</p>
                  <h3>{phase.title}</h3>
                  <p className="phase-summary">{phase.summary}</p>

                  <span className={`resp-badge resp-${responsibilityTone(phase.responsibility)}`}>
                    <Icon name="users" size={14} />
                    {phase.responsibility}
                  </span>

                  <button
                    type="button"
                    className="phase-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => {
                      setOpenPhase(isOpen ? null : phase.id);
                      if (!isOpen) trackEvent('roadmap_phase_open', { phase: phase.id });
                    }}
                  >
                    {isOpen ? 'Hide details' : `Show ${phase.tasks.length} steps`}
                    <span className="phase-chevron" aria-hidden="true">+</span>
                  </button>

                  <div className="phase-tasks-wrap">
                    <div className="phase-tasks" id={panelId} aria-hidden={!isOpen}>
                      <ol>
                        {phase.tasks.map((task) => (
                          <li key={task}>{task}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
