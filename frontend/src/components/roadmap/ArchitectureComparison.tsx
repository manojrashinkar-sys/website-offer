import { comparisonLabels, comparisonRows } from '../../content/roadmapContent';
import Reveal from '../Reveal';

// Every label used by either architecture, de-duplicated, so the chip row
// stays in step with the data instead of being written out by hand.
const allLabels = Array.from(
  new Set([...comparisonLabels.profile, ...comparisonLabels.application]),
);

// One table at every width. Stacking this as two cards on mobile repeated the
// eleven area names and produced twice the rows; keeping the two architectures
// side by side lets each row be as tall as its longest cell and no taller.
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
                  <th scope="col">Business Profile</th>
                  <th scope="col">Advanced Application</th>
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

        <div className="compare-labels">
          {allLabels.map((label) => (
            <span className="label-chip" key={label}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
