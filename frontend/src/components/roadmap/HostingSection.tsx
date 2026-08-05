import { hostingOptions, hostingStatement } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';
import TagList from './TagList';

export default function HostingSection() {
  return (
    <section className="section section-alt" id="hosting">
      <div className="container">
        <div className="section-head">
          <h2>Hosting Selected According to Your Project</h2>
          <p>Where your website runs depends on what it has to do, not on a default choice.</p>
        </div>

        <div className="hosting-grid">
          {hostingOptions.map((option, index) => (
            <Reveal key={option.title} delay={index * 70} className="hosting-card">
              <span className="info-card-icon" aria-hidden="true">
                <Icon name={option.icon} size={22} />
              </span>
              <h3>{option.title}</h3>

              <h4>Examples</h4>
              <TagList items={option.examples} tone="brand" label={`${option.title}: examples`} />

              <h4>Best for</h4>
              <ul className="dot-list">
                {option.bestFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {option.benefits && (
                <>
                  <h4>Benefits</h4>
                  <ul className="dot-list">
                    {option.benefits.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </Reveal>
          ))}
        </div>

        <p className="section-note">{hostingStatement}</p>
      </div>
    </section>
  );
}
