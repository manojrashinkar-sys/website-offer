import { pricingCategories, pricingFactors } from '../../content/roadmapContent';
import Icon from '../Icon';
import Reveal from '../Reveal';
import TagList from './TagList';

export default function PricingApproach() {
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="section-head">
          <h2>How Website Cost Is Determined</h2>
          <p>
            There is no per-technology price list. Most of the tools we use are open source
            or included with the hosting service — what a project costs depends on the work
            it actually involves.
          </p>
        </div>

        <Reveal className="status-card pricing-factors">
          <h3>Cost is determined by the scope of work</h3>
          <TagList items={pricingFactors} tone="brand" label="Factors that determine project cost" />
        </Reveal>

        <div className="pricing-grid">
          {pricingCategories.map((category, index) => (
            <Reveal
              key={category.title}
              delay={index * 70}
              className={`pricing-card ${category.featured ? 'featured' : ''}`}
            >
              <span className="info-card-icon" aria-hidden="true">
                <Icon name={category.icon} size={22} />
              </span>
              <h3>{category.title}</h3>

              <h4>Suitable for</h4>
              <ul className="dot-list">
                {category.suitableFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="pricing-label-block">
                <span className="pricing-label">{category.priceLabel}</span>
                {category.secondaryLabel && (
                  <span className="pricing-sublabel">{category.secondaryLabel}</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
