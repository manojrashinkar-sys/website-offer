interface Props {
  size?: number;
}

// Mark for MIRA, the website assistant.
//
// A four-point spark with a smaller companion — the shape that now reads as
// "assistant" across Gemini, Copilot and most other tools, so visitors
// recognise what it is before reading a word. A speech bubble says "chat
// widget"; a robot says "toy". This says "capable".
//
// Two solid paths in currentColor: no strokes to thin out at 20px, no
// gradients to manage across themes, and it inherits whatever colour the
// launcher or header is using.
export default function AssistantMark({ size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Primary spark. Quadratic curves give the concave waist that makes a
          four-point star read as light rather than as a diamond. */}
      <path d="M10.5 3 Q11.4 10.3 18 11.2 Q11.4 12.1 10.5 19.4 Q9.6 12.1 3 11.2 Q9.6 10.3 10.5 3 Z" />
      {/* Companion spark, offset to break the symmetry and suggest motion. */}
      <path d="M18.4 14.2 Q18.8 17.2 21.6 17.6 Q18.8 18 18.4 21 Q18 18 15.2 17.6 Q18 17.2 18.4 14.2 Z" />
    </svg>
  );
}
