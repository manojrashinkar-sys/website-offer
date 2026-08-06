// Background treatment for the dark hero sections: three slow-drifting colour
// fields behind a fine grid that fades out toward the edges.
//
// Deliberately restrained — the movement is slow enough to read as depth
// rather than as animation, and everything is decorative, so it is hidden
// from assistive technology and disabled under prefers-reduced-motion.
export default function HeroAurora() {
  return (
    <div className="hero-aurora" aria-hidden="true">
      <span className="aurora-field aurora-1" />
      <span className="aurora-field aurora-2" />
      <span className="aurora-field aurora-3" />
      <span className="hero-grid" />
    </div>
  );
}
