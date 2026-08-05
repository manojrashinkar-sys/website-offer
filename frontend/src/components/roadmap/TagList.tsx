interface Props {
  items: readonly string[];
  label?: string;
  tone?: 'neutral' | 'brand';
}

// Compact chip list — used wherever the content is a plain enumeration
// (suitable-for lists, feature lists, hosting examples) and full cards
// would make the page far longer than it needs to be.
export default function TagList({ items, label, tone = 'neutral' }: Props) {
  return (
    <ul className={`tag-list tag-${tone}`} aria-label={label}>
      {items.map((item) => (
        <li className="tag" key={item}>{item}</li>
      ))}
    </ul>
  );
}
