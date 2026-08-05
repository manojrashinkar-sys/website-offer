import { ownershipColumns, ownershipNotes } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';

export default function OwnershipSection() {
  return (
    <section className="section section-alt" id="ownership">
      <div className="container">
        <div className="section-head">
          <h2>Clear Ownership, Clear Responsibilities</h2>
          <p>Everyone knows what they hold, what they pay for, and what they approve.</p>
        </div>

        <Reveal className="ownership-statement">
          <span className="ownership-statement-icon" aria-hidden="true">
            <Icon name="key" size={24} />
          </span>
          <p>The client should always retain ownership of the domain.</p>
        </Reveal>

        <div className="ownership-grid">
          {ownershipColumns.map((column, index) => (
            <Reveal
              key={column.title}
              delay={index * 70}
              className={`ownership-card ownership-${column.tone}`}
            >
              <span className="ownership-icon" aria-hidden="true">
                <Icon name={column.icon} size={22} />
              </span>
              <h3>{column.title}</h3>
              <ul className="dot-list">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="status-card ownership-notes">
          <h3>Registrar and hosting do not have to be the same company</h3>
          <ul className="tick-list">
            {ownershipNotes.map((note) => (
              <li key={note}>
                <span className="tick" aria-hidden="true">
                  <Icon name="check-circle" size={17} />
                </span>
                {note}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
