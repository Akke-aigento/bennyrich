import { Monogram, type NeonTone } from "./Monogram";

const strokeClass: Record<NeonTone, string> = {
  blue: "neon-stroke-blue",
  pink: "neon-stroke-pink",
  mono: "",
};

const textClass: Record<NeonTone, string> = {
  blue: "neon-text-blue",
  pink: "neon-text-pink",
  mono: "",
};

/**
 * Stacked BennyRich lockup: monogram over the outlined "BENNY RICH" wordmark,
 * with the optional tagline and "NEW YORK" city line beneath it.
 *
 * `layout="inline"` is the compact header lockup — monogram and text on one
 * line. The wordmark is set solid rather than outlined below ~20px, where a
 * 1px text-stroke closes up and stops reading.
 */
export function Wordmark({
  tone = "blue",
  layout = "stacked",
  size = 34,
  showCity = false,
  showTagline = false,
  className = "",
}: {
  tone?: NeonTone;
  layout?: "stacked" | "inline";
  /** Font size of the "BENNY RICH" wordmark, in px. */
  size?: number;
  showCity?: boolean;
  showTagline?: boolean;
  className?: string;
}) {
  const outlined = size >= 20;
  const wordmark = (
    <span
      className={outlined ? strokeClass[tone] : textClass[tone]}
      style={{
        fontFamily: "var(--br-font-display)",
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "var(--br-tracking-wordmark)",
        textTransform: "uppercase",
        // Tracking adds trailing space after the final letter; pull it back so
        // the lockup optically centres.
        marginRight: "-0.18em",
        whiteSpace: "nowrap",
      }}
    >
      Benny Rich
    </span>
  );

  if (layout === "inline") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
        <Monogram tone={tone} size={size * 1.15} />
        {wordmark}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-center ${className}`.trim()}>
      <Monogram tone={tone} size={size * 1.55} />
      <span style={{ marginTop: size * 0.28 }}>{wordmark}</span>
      {showCity && (
        <span
          className={textClass[tone]}
          style={{
            fontFamily: "var(--br-font-body)",
            fontSize: Math.max(9, size * 0.3),
            fontWeight: 400,
            letterSpacing: "var(--br-tracking-city)",
            textTransform: "uppercase",
            marginTop: size * 0.32,
            marginRight: "-0.4em",
          }}
        >
          New York
        </span>
      )}
      {showTagline && (
        <span
          className="br-tagline"
          style={{
            fontSize: Math.max(9, size * 0.28),
            color: "var(--br-mute)",
            marginTop: size * 0.3,
            marginRight: "-0.3em",
          }}
        >
          Timeless. Bold. Luxurious.
        </span>
      )}
    </span>
  );
}
