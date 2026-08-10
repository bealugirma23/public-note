export function CircuitBackground() {
  return (
    <svg style={{ position: 'absolute', inset: 0, zIndex: -1 }} width="100%" height="100%">
      <defs>
        <pattern id="circuit" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 40 H30 M50 40 H80 M40 0 V30 M40 50 V80" stroke="#4f46e5" strokeWidth="1" opacity="0.25" />
          <circle cx="40" cy="40" r="3" fill="#818cf8" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#0b0b16" />
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  );
}
