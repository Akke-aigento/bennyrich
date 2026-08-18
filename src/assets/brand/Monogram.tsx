export type NeonTone = "blue" | "pink" | "mono";

export const glowClass: Record<NeonTone, string> = {
  blue: "neon-glow-blue",
  pink: "neon-glow-pink",
  mono: "",
};

/**
 * BennyRich monogram — a hairline circle enclosing an overlapping serif "B"
 * and "R". The R sits down-right of the B so its stem crosses the B's lower
 * bowl, which is the join the printed logo is built around.
 *
 * Drawn as strokes in `currentColor` so the neon utilities can light it up.
 */
export function Monogram({
  tone = "blue",
  size = 40,
  className = "",
  title,
}: {
  tone?: NeonTone;
  size?: number | string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={`${glowClass[tone]} ${className}`.trim()}
      style={tone === "mono" ? undefined : { color: `var(--br-${tone})` }}
    >
      {title ? <title>{title}</title> : null}

      {/* Enclosing ring */}
      <circle cx="50" cy="50" r="45" strokeWidth="2" />

      {/* B — up and to the left */}
      <g strokeWidth="2.5">
        <path d="M32 26V64" />
        <path d="M26 26h13" />
        <path d="M26 64h13" />
        <path d="M33 26h7c6.5 0 9.5 3 9.5 7.8 0 4.7-3 7.8-9.5 7.8h-7" />
        <path d="M33 41.6h9c7.5 0 10.5 3.4 10.5 11.2C52.5 60 49.5 64 42 64h-9" />
      </g>

      {/* R — down and to the right, stem crossing the B's lower bowl */}
      <g strokeWidth="2.5">
        <path d="M56 36v38" />
        <path d="M50 36h13" />
        <path d="M50 74h14" />
        <path d="M57 36h8c7 0 10 3.5 10 8.5S72 53 65 53h-8" />
        <path d="M64 53c3 6 6 14 10 21" />
      </g>
    </svg>
  );
}
