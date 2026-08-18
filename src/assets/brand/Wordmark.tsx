import { Monogram, type NeonTone } from "./Monogram";

const logotypeClass: Record<NeonTone, string> = {
  blue: "logotype-blue",
  pink: "logotype-pink",
  mono: "",
};

const textClass: Record<NeonTone, string> = {
  blue: "neon-text-blue",
  pink: "neon-text-pink",
  mono: "",
};

/**
 * Stacked BennyRich lockup: monogram over the "BENNY RICH" wordmark, with the
 * optional tagline and "NEW YORK" city line beneath it.
 *
 * `layout="inline"` is the compact header lockup — monogram and text on one
 * line.
 *
 * The wordmark is set solid in --br-blue with only a whisper of a halo. It was
 * an outlined, fully-glowing sign in BR-2 and read as neon tubing; a maison
 * logotype has to hold its shape at 18px in a header, so the outline and the
 * bloom are both gone.
 */
export function Wordmark({
  tone = "blue",
  layout = "stacked",
  size = 32,
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
  const wordmark = (
    <span
      className={logotypeClass[tone]}
      style={{
        fontFamily: "var(--br-font-display)",
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "var(--br-tracking-wordmark)",
        textTransform: "uppercase",
        // Tracking adds trailing space after the final letter; pull it back so
        // the lockup optically centres.
        marginRight: "calc(var(--br-tracking-wordmark) * -1)",
        whiteSpace: "nowrap",
      }}
    >
      Benny Rich
    </span>
  );

  if (layout === "inline") {
    return (
      <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
        <Monogram tone={tone} intensity="logotype" size={size * 1.2} />
        {wordmark}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-center ${className}`.trim()}>
      <Monogram tone={tone} intensity="logotype" size={size * 1.5} />
      <span style={{ marginTop: size * 0.34 }}>{wordmark}</span>
      {showCity && (
        <span
          className={logotypeClass[tone]}
          style={{
            fontFamily: "var(--br-font-body)",
            fontSize: Math.max(9, size * 0.28),
            fontWeight: 400,
            letterSpacing: "var(--br-tracking-city)",
            textTransform: "uppercase",
            marginTop: size * 0.38,
            marginRight: "calc(var(--br-tracking-city) * -1)",
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
            marginTop: size * 0.34,
            marginRight: "calc(var(--br-tracking-tagline) * -1)",
          }}
        >
          Timeless. Bold. Luxurious.
        </span>
      )}
    </span>
  );
}

/** Kept so the emphatic treatment stays available outside the lockups. */
export const wordmarkSignClass = textClass;
