/**
 * A website assembling itself: the hero illustration for the Web Services
 * home page.
 *
 * Hand-drawn SVG rather than a Lottie file. A Lottie needs lottie-web, which
 * is roughly 70KB gzipped of runtime before the animation JSON is counted, on
 * a page whose entire JavaScript is currently a little over 100KB. This is
 * about 4KB of markup and needs nothing at runtime.
 *
 * The other reason is that a stock animation is one that thousands of other
 * sites also use. For a business that builds websites, an illustration of a
 * website being built — drawn for this page, matching this palette — is the
 * argument as well as the decoration.
 *
 * It builds once and then idles. A loop that tore the page down and rebuilt
 * it every eight seconds would pull the eye back every time the visitor
 * started reading, which is the opposite of what a hero should do.
 *
 * Decorative: aria-hidden, because the copy beside it already says all of
 * this in words. Timings live in community.css.
 */
export default function BuildScene() {
  // Card row in the mock body — kept as data so the stagger is one rule.
  const cards = [0, 1, 2];

  return (
    <div className="build-scene" aria-hidden="true">
      <svg viewBox="0 0 440 330" role="presentation" focusable="false">
        <defs>
          <linearGradient id="bs-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="bs-clip">
            <rect x="24" y="18" width="360" height="238" rx="12" />
          </clipPath>
        </defs>

        {/* ---- Browser window ---- */}
        <g className="bs-window">
          <rect x="24" y="18" width="360" height="238" rx="12"
                className="bs-frame" />
          <line x1="24" y1="52" x2="384" y2="52" className="bs-hairline" />

          {/* Chrome: three dots and an address pill */}
          <circle cx="44" cy="35" r="4" className="bs-dot" style={{ '--i': 0 } as never} />
          <circle cx="58" cy="35" r="4" className="bs-dot" style={{ '--i': 1 } as never} />
          <circle cx="72" cy="35" r="4" className="bs-dot" style={{ '--i': 2 } as never} />
          <rect x="90" y="28" width="180" height="14" rx="7" className="bs-address" />
          <rect x="90" y="28" width="180" height="14" rx="7" className="bs-address-fill" />

          {/* ---- Page content, assembling in reading order ---- */}
          <g clipPath="url(#bs-clip)">
            {/* Nav */}
            <rect x="44" y="70" width="46" height="7" rx="3.5" className="bs-el" style={{ '--d': '0.9s' } as never} />
            <rect x="250" y="70" width="26" height="6" rx="3" className="bs-el bs-dim" style={{ '--d': '1.0s' } as never} />
            <rect x="286" y="70" width="26" height="6" rx="3" className="bs-el bs-dim" style={{ '--d': '1.06s' } as never} />
            <rect x="322" y="70" width="38" height="6" rx="3" className="bs-el" style={{ '--d': '1.12s' } as never} />

            {/* Headline */}
            <rect x="44" y="100" width="196" height="13" rx="6" className="bs-el" style={{ '--d': '1.35s' } as never} />
            <rect x="44" y="122" width="140" height="13" rx="6" className="bs-el" style={{ '--d': '1.45s' } as never} />

            {/* Body copy */}
            <rect x="44" y="150" width="168" height="6" rx="3" className="bs-el bs-dim" style={{ '--d': '1.65s' } as never} />
            <rect x="44" y="163" width="132" height="6" rx="3" className="bs-el bs-dim" style={{ '--d': '1.72s' } as never} />

            {/* Call to action, which then keeps a slow pulse */}
            <rect x="44" y="184" width="78" height="22" rx="11" className="bs-el bs-cta" style={{ '--d': '1.95s' } as never} />

            {/* Media block */}
            <rect x="256" y="100" width="104" height="86" rx="9" className="bs-el bs-media" style={{ '--d': '2.2s' } as never} />

            {/* Card row */}
            {cards.map((n) => (
              <rect
                key={n}
                x={44 + n * 108} y={222} width="96" height="46" rx="9"
                className="bs-el bs-card"
                style={{ '--d': `${2.5 + n * 0.12}s` } as never}
              />
            ))}

            {/* Slow highlight travelling across the finished page */}
            <rect x="-160" y="18" width="150" height="238" className="bs-sweep" fill="url(#bs-sweep)" />
          </g>
        </g>

        {/* ---- Phone, overlapping the window: the same site, stacked ---- */}
        <g className="bs-phone">
          <rect x="300" y="176" width="98" height="140" rx="14" className="bs-frame bs-phone-frame" />
          <rect x="326" y="186" width="46" height="4" rx="2" className="bs-notch" />
          <rect x="312" y="200" width="52" height="8" rx="4" className="bs-el bs-on-phone" style={{ '--d': '3.3s' } as never} />
          <rect x="312" y="214" width="74" height="5" rx="2.5" className="bs-el bs-on-phone bs-dim" style={{ '--d': '3.38s' } as never} />
          <rect x="312" y="224" width="60" height="5" rx="2.5" className="bs-el bs-on-phone bs-dim" style={{ '--d': '3.44s' } as never} />
          <rect x="312" y="240" width="74" height="30" rx="7" className="bs-el bs-on-phone bs-media" style={{ '--d': '3.55s' } as never} />
          <rect x="312" y="278" width="50" height="16" rx="8" className="bs-el bs-on-phone bs-cta" style={{ '--d': '3.7s' } as never} />
        </g>

        {/* ---- Cursor: arrives, then rests on the call to action ---- */}
        <g className="bs-cursor">
          <path d="M0 0 L0 14 L3.6 10.6 L6 16 L8.6 14.8 L6.2 9.6 L11 9.4 Z" />
        </g>
      </svg>
    </div>
  );
}
