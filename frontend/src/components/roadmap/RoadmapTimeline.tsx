import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { roadmapPhases, type RoadmapPhase } from '../../content/roadmapContent';
import { useIsMobile } from '../../hooks/useMediaQuery';
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

function RespBadge({ value }: { value: string }) {
  return (
    <span className={`resp-badge resp-${responsibilityTone(value)}`}>
      <Icon name="users" size={14} />
      {value}
    </span>
  );
}

/* ---------- Desktop: stage list with a pinned detail panel ---------- */

function DesktopTimeline() {
  const [activeId, setActiveId] = useState(roadmapPhases[0].id);
  const activeIndex = roadmapPhases.findIndex((phase) => phase.id === activeId);
  const active = roadmapPhases[activeIndex] ?? roadmapPhases[0];

  const select = (phase: RoadmapPhase) => {
    setActiveId(phase.id);
    trackEvent('roadmap_phase_open', { phase: phase.id });
  };

  // Arrow keys walk the stages, as expected of a vertical tab list.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = activeIndex;
    if (event.key === 'ArrowDown') next = (activeIndex + 1) % roadmapPhases.length;
    if (event.key === 'ArrowUp') next = (activeIndex - 1 + roadmapPhases.length) % roadmapPhases.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = roadmapPhases.length - 1;
    select(roadmapPhases[next]);
    (event.currentTarget.querySelectorAll<HTMLElement>('.stage-item')[next])?.focus();
  };

  return (
    <div className="stage-layout">
      <div className="stage-list" role="tablist" aria-orientation="vertical" aria-label="Delivery phases" onKeyDown={onKeyDown}>
        {roadmapPhases.map((phase, index) => {
          const isActive = phase.id === activeId;
          return (
            <button
              key={phase.id}
              role="tab"
              type="button"
              id={`stage-tab-${phase.id}`}
              aria-selected={isActive}
              aria-controls="stage-detail"
              tabIndex={isActive ? 0 : -1}
              className={`stage-item ${isActive ? 'active' : ''} ${index < activeIndex ? 'passed' : ''}`}
              onClick={() => select(phase)}
            >
              <span className="stage-rail" aria-hidden="true" />
              <span className="stage-dot" aria-hidden="true">
                <Icon name={phase.icon} size={18} />
              </span>
              <span className="stage-text">
                <small>Phase {index + 1}</small>
                <strong>{phase.title}</strong>
              </span>
            </button>
          );
        })}
      </div>

      <div className="stage-detail-wrap">
        <div
          className="stage-detail"
          id="stage-detail"
          role="tabpanel"
          aria-labelledby={`stage-tab-${active.id}`}
          tabIndex={-1}
          key={active.id}
        >
          <p className="phase-eyebrow">Phase {activeIndex + 1} of {roadmapPhases.length}</p>
          <h3>{active.title}</h3>
          <p className="stage-summary">{active.summary}</p>
          <RespBadge value={active.responsibility} />

          <h4>What happens in this phase</h4>
          <ol className="stage-tasks">
            {active.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ol>

          <div className="stage-progress" aria-hidden="true">
            <span style={{ width: `${((activeIndex + 1) / roadmapPhases.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile: vertical accordion ---------- */

function MobileTimeline() {
  const [openPhase, setOpenPhase] = useState<string | null>(roadmapPhases[0].id);

  return (
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
              <RespBadge value={phase.responsibility} />

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
  );
}

// Six phases instead of a flat list of forty-odd tasks. On desktop the detail
// is pinned beside the stage list so choosing a stage never moves the page
// under the cursor; on phones that pattern has nowhere to pin to, so the
// accordion stays.
export default function RoadmapTimeline() {
  const isMobile = useIsMobile();

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
        {isMobile ? <MobileTimeline /> : <DesktopTimeline />}
      </div>
    </section>
  );
}
