import type { CSSProperties } from 'react';

interface Props {
  nodes: readonly string[];
  /** `wrap` flows left-to-right and wraps; `stack` is always one per row. */
  variant?: 'wrap' | 'stack';
  numbered?: boolean;
  label: string;
  tone?: 'light' | 'dark';
}

// The architecture diagrams on this page are all the same shape: an ordered
// chain of labelled steps joined by arrows. Arrows are drawn with CSS
// pseudo-elements so they never end up in the accessibility tree or in
// copied text.
//
// Each node publishes its position as --flow-i so a stylesheet can stagger
// animations along the chain without the component knowing anything about
// the motion itself.
export default function FlowChain({
  nodes,
  variant = 'wrap',
  numbered = false,
  label,
  tone = 'light',
}: Props) {
  return (
    <ol className={`flow-chain flow-${variant} flow-tone-${tone}`} aria-label={label}>
      {nodes.map((node, index) => (
        <li
          className="flow-node"
          key={node}
          style={{ '--flow-i': index } as CSSProperties}
        >
          {numbered && <span className="flow-node-index" aria-hidden="true">{index + 1}</span>}
          <span className="flow-node-label">{node}</span>
        </li>
      ))}
    </ol>
  );
}
