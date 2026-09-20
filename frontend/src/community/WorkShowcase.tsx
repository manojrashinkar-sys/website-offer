import { useState } from 'react';
import { work, type WorkItem } from '../content/communityContent';
import { trackEvent } from '../analytics';
import SafeImage from './SafeImage';
import Icon from '../components/Icon';

const projectId = (index: number) => `client-project-${index + 1}`;

function Project({ item, index }: { item: WorkItem; index: number }) {
  const [shot, setShot] = useState(0);
  const shots = item.shots ?? [];
  const current = shots[shot];
  return (
    <article className="portfolio-project" id={projectId(index)} aria-labelledby={`${projectId(index)}-title`}>
      <header className="portfolio-heading">
        <div>
          <p className="portfolio-category">{item.type}</p>
          <h2 id={`${projectId(index)}-title`}>{item.name}</h2>
          <p className="portfolio-sector">{item.sector}</p>
        </div>
        <span className={`portfolio-status ${item.status === 'preview' ? 'is-preview' : ''}`}>{item.status === 'preview' ? 'In review' : 'Live website'}</span>
      </header>
      <div className="portfolio-body">
        <div className="portfolio-media">
          {current && <>
            <a className="portfolio-image-link" href={current.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full screenshot: ${current.alt}`}>
              <SafeImage key={current.src} figureClassName="portfolio-image" src={current.src} alt={current.alt} width={1000} height={505} />
            </a>
            <div className="portfolio-image-caption"><span>Tap image to enlarge</span></div>
          </>}
          {shots.length > 1 && <div className="portfolio-thumbnails" role="group" aria-label={`${item.name} screenshots`}>
            {shots.map((image, i) => <button type="button" key={image.src} className={`portfolio-thumbnail ${shot === i ? 'is-selected' : ''}`} aria-pressed={shot === i} aria-label={`Show screenshot: ${image.alt}`} onClick={() => setShot(i)}>
              <img src={image.src} alt="" width={1000} height={505} loading="lazy" decoding="async" />
            </button>)}
          </div>}
        </div>
        <div className="portfolio-details">
          <h3>What we built</h3>
          <ul>{item.highlights.map(highlight => <li key={highlight}><Icon name="check-circle" size={17} /><span>{highlight}</span></li>)}</ul>
          <a className="btn btn-primary portfolio-visit" href={item.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('community_work_click', { project: item.name })}>
            {item.status === 'preview' ? 'View the preview' : 'Visit the website'}<Icon name="arrow-right" size={17} />
          </a>
        </div>
      </div>
    </article>
  );
}

/** Every client stays visible in the document; no timer or hidden project tabs. */
export default function WorkShowcase() {
  return (
    <div className="portfolio">
      <div className="portfolio-list">{work.map((item, index) => <Project key={item.name} item={item} index={index} />)}</div>
    </div>
  );
}
