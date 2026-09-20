import { useEffect, useRef, useState } from 'react';
import { stepDetail, steps } from '../content/communityContent';
import Icon from '../components/Icon';

/**
 * The six stages as a stepper you move through, rather than six cards you
 * scroll past.
 *
 * A process is a sequence, and a stack of equal cards is the one shape that
 * fails to say so — every stage looks like a sibling rather than a step. A
 * rail with a filled portion says where you are and how much is left, which
 * is the actual information in the word "process".
 *
 * A real tablist: arrow keys walk the rail, Home and End jump to the ends,
 * selection follows focus, and only the current tab is in the tab order.
 * Previous and Next are ordinary buttons beneath, because a visitor reading
 * rather than navigating wants to go forward without aiming at a small node.
 */
export default function ProcessStepper() {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const last = steps.length - 1;
  const step = steps[active];
  const detail = stepDetail[step.n];

  const focusTab = (index: number) => {
    railRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    let next = active;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = active === last ? 0 : active + 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = active === 0 ? last : active - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    setActive(next);
    focusTab(next);
  };

  // Keep the current node in view when the rail scrolls sideways on a phone.
  // scrollLeft on the rail itself, never scrollIntoView — that walks up and
  // drags the whole document with it.
  useEffect(() => {
    const rail = railRef.current;
    const node = rail?.querySelectorAll<HTMLElement>('[role="tab"]')[active];
    if (!rail || !node) return;
    if (rail.scrollWidth <= rail.clientWidth) return;
    const target = node.offsetLeft - (rail.clientWidth - node.offsetWidth) / 2;
    rail.scrollTo({
      left: Math.max(0, Math.min(target, rail.scrollWidth - rail.clientWidth)),
      behavior: 'smooth',
    });
  }, [active]);

  // How far along the rail the filled portion reaches: the centre of the
  // current node, so the fill stops under it rather than past it.
  const progress = (active / last) * 100;

  return (
    <div className="stepper">
      <div
        className="stepper-rail"
        role="tablist"
        aria-label="Project stages"
        ref={railRef}
        onKeyDown={onKeyDown}
      >
        <div className="stepper-line" aria-hidden="true">
          <span className="stepper-line-fill" style={{ width: `${progress}%` }} />
        </div>

        {steps.map((item, index) => (
          <button
            key={item.n}
            type="button"
            role="tab"
            id={`stage-tab-${index}`}
            aria-selected={index === active}
            aria-controls="stage-panel"
            tabIndex={index === active ? 0 : -1}
            className={[
              'stepper-node',
              index === active ? 'is-active' : '',
              index < active ? 'is-done' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => setActive(index)}
          >
            <span className="stepper-node-dot">
              {index < active ? <Icon name="check-circle" size={14} /> : item.n}
            </span>
            <span className="stepper-node-label">{item.title}</span>
          </button>
        ))}
      </div>

      <div
        className="stepper-panel"
        role="tabpanel"
        id="stage-panel"
        aria-labelledby={`stage-tab-${active}`}
        tabIndex={0}
        // Keyed so the panel remounts and its entrance runs on every change;
        // without it the text swaps with nothing to mark that it moved.
        key={step.n}
      >
        <p className="stepper-count">
          Stage {active + 1} of {steps.length}
        </p>
        <h3 className="stepper-title">{step.title}</h3>
        <p className="stepper-lead">{step.body}</p>

        {detail && (
          <div className="stepper-detail">
            <div>
              <h4 className="service-label">What you provide</h4>
              <p>{detail.youProvide}</p>
            </div>
            <div>
              <h4 className="service-label">What you get</h4>
              <p>{detail.youGet}</p>
            </div>
          </div>
        )}

        <div className="stepper-controls">
          <button
            type="button"
            className="stepper-move"
            onClick={() => setActive(active - 1)}
            disabled={active === 0}
          >
            <Icon name="arrow-right" size={15} />
            Previous
          </button>
          <button
            type="button"
            className="stepper-move stepper-move-next"
            onClick={() => setActive(active + 1)}
            disabled={active === last}
          >
            Next
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
