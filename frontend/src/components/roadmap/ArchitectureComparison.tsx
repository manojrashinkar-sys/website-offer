import { comparisonLabels, comparisonRows } from '../../content/roadmapContent';
import Reveal from '../Reveal';

// Rendered twice: a table for wide screens and a card per architecture for
// narrow ones. Only one is ever displayed (the other is display:none, so it
// stays out of the accessibility tree too), which avoids either a cramped
// eleven-row table on a phone or a scroll-hunt across two columns.
export default function ArchitectureComparison() {
  return (
    <section className="section" id="comparison">
      <div className="container">
        <div className="section-head">
          <h2>Which Website Architecture Do You Need?</h2>
          <p>
            The same eleven decisions come up on every project. Here is how the two paths
            differ on each of them.
          </p>
        </div>

        <Reveal className="compare-table-wrap">
          <div className="table-wrap">
            <table className="compare-table">
              <caption className="sr-only">
                Business Profile Website compared with Advanced Web Application
              </caption>
              <thead>
                <tr>
                  <th scope="col">Area</th>
                  <th scope="col">Business Profile Website</th>
                  <th scope="col">Advanced Web Application</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.area}>
                    <th scope="row">{row.area}</th>
                    <td>{row.profile}</td>
                    <td>{row.application}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <div className="compare-cards">
          {(['profile', 'application'] as const).map((column, index) => (
            <Reveal
              key={column}
              delay={index * 80}
              className="status-card compare-card"
            >
              <h3>{column === 'profile' ? 'Business Profile Website' : 'Advanced Web Application'}</h3>
              <ul className="tag-list tag-brand">
                {comparisonLabels[column].map((label) => (
                  <li className="tag" key={label}>{label}</li>
                ))}
              </ul>
              <dl className="compare-dl">
                {comparisonRows.map((row) => (
                  <div className="compare-dl-row" key={row.area}>
                    <dt>{row.area}</dt>
                    <dd>{row[column]}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        <div className="compare-labels">
          <span className="label-chip">Low infrastructure requirement</span>
          <span className="label-chip">Managed deployment</span>
          <span className="label-chip">Custom infrastructure</span>
          <span className="label-chip">Scope-based quotation</span>
          <span className="label-chip">Advanced maintenance</span>
        </div>
      </div>
    </section>
  );
}
