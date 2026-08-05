import { useState } from 'react';
import { trackEvent } from '../../analytics';
import { solutionOptions } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';
import FlowChain from './FlowChain';
import TagList from './TagList';

// Segmented selector rather than two long stacked cards: both options carry a
// lot of detail, and showing them at once doubles the height of the page for
// information most visitors only need one half of.
export default function SolutionSelector() {
  const [activeId, setActiveId] = useState(solutionOptions[0].id);
  const active = solutionOptions.find((option) => option.id === activeId) ?? solutionOptions[0];

  return (
    <section className="section section-alt" id="website-options">
      <div className="container">
        <div className="section-head">
          <h2>Which Website Solution Fits Your Business?</h2>
          <p>
            Most projects fall into one of two paths. Choose the one that sounds closest to
            your requirement to see how it is built.
          </p>
        </div>

        <div className="solution-tabs" role="tablist" aria-label="Website solution options">
          {solutionOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={`solution-tab-${option.id}`}
              aria-selected={option.id === activeId}
              aria-controls={`solution-panel-${option.id}`}
              tabIndex={option.id === activeId ? 0 : -1}
              className={`solution-tab ${option.id === activeId ? 'active' : ''}`}
              onClick={() => {
                setActiveId(option.id);
                trackEvent('roadmap_solution_view', { option: option.id });
              }}
            >
              <span className="solution-tab-icon" aria-hidden="true">
                <Icon name={option.icon} size={20} />
              </span>
              <span className="solution-tab-text">
                <strong>{option.name}</strong>
                <small>{option.badge}</small>
              </span>
            </button>
          ))}
        </div>

        <Reveal
          key={active.id}
          className="status-card solution-panel"
          // `key` remounts the panel so the reveal animation replays on switch.
        >
          <div
            role="tabpanel"
            id={`solution-panel-${active.id}`}
            aria-labelledby={`solution-tab-${active.id}`}
            tabIndex={-1}
          >
            <span className="status-badge review">{active.badge}</span>
            <h3 className="solution-title">{active.name}</h3>
            <p className="solution-summary">{active.summary}</p>

            <div className="solution-grid">
              <div className="solution-block">
                <h4>{active.suitableHeading}</h4>
                <TagList items={active.suitableFor} label={`${active.name}: ${active.suitableHeading}`} />
              </div>

              <div className="solution-block">
                <h4>{active.detailHeading}</h4>
                <TagList
                  items={active.details}
                  tone="brand"
                  label={`${active.name}: ${active.detailHeading}`}
                />
              </div>
            </div>

            <div className="solution-block solution-architecture">
              <h4>{active.architectureHeading}</h4>
              <FlowChain
                nodes={active.architecture}
                numbered
                label={`${active.name}: ${active.architectureHeading}`}
              />
            </div>

            <div className="solution-block">
              <h4>{active.notesHeading}</h4>
              <ul className="tick-list">
                {active.notes.map((note) => (
                  <li key={note}>
                    <span className="tick" aria-hidden="true">
                      <Icon name="check-circle" size={17} />
                    </span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <p className="section-note solution-footnote">{active.footnote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
