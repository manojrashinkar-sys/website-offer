// Abstract gradient monogram used in place of a business name/logo that
// hasn't been decided yet. Swap this out for a real logo image once one
// exists — nothing elsewhere references its internals.
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#logoGrad)" />
        <path
          d="M11 25 L16 14 L20 21 L24 14 L29 25"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
