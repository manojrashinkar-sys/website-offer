interface Props {
  size?: number;
}

// Mark for the Website Assistant: a rounded speech form with a four-point
// spark inside it. Solid shapes rather than strokes, because a 1.5px stroke
// disappears at 20px on a phone — this stays legible down to 16px.
//
// Deliberately not a robot or a face. Business owners read those as toys;
// this reads as a conversation with something capable.
export default function AssistantMark({ size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Speech form — asymmetric tail so it reads as dialogue, not a box. */}
      <path
        d="M4.6 3.2h14.8a2.4 2.4 0 0 1 2.4 2.4v9a2.4 2.4 0 0 1-2.4 2.4H9.9l-4.4 3.5a.8.8 0 0 1-1.3-.63V17H4.6a2.4 2.4 0 0 1-2.4-2.4v-9A2.4 2.4 0 0 1 4.6 3.2Z"
        fill="currentColor"
      />
      {/* Spark, knocked out of the bubble so it works on any background. */}
      <path
        d="M12 6.2l1.05 2.83a1.4 1.4 0 0 0 .82.82L16.7 10.9l-2.83 1.05a1.4 1.4 0 0 0-.82.82L12 15.6l-1.05-2.83a1.4 1.4 0 0 0-.82-.82L7.3 10.9l2.83-1.05a1.4 1.4 0 0 0 .82-.82L12 6.2Z"
        className="assistant-mark-spark"
      />
    </svg>
  );
}
