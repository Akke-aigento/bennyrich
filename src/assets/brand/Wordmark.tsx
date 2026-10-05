import type { NeonTone } from "./Monogram";

const textClass: Record<NeonTone, string> = {
  blue: "neon-text-blue",
  pink: "neon-text-pink",
  mono: "",
};

/** The client's official artwork. Pixel sizes are the delivered crops. */
const LOCKUP = { src: "/brand/logo-lockup-blue.png", width: 829, height: 395 };
const INLINE = { src: "/brand/logo-wordmark-blue.png", width: 829, height: 125 };

/** Cap height of "BENNY RICH" as a fraction of each crop's height. */
const CAP_OF_HEIGHT = { lockup: 94 / 395, inline: 94 / 125 };

/**
 * BennyRich lockup.
 *
 * `layout="stacked"` is the full official lockup — BR monogram over BENNY RICH
 * over VODKA. `layout="inline"` is the written-out wordmark on its own,
 * which is what a header needs.
 *
 * Since BR-11 both are the client's official neon render (`public/brand/`)
 * rather than type set in Bodoni Moda. Consequences worth knowing:
 *
 *  - The artwork carries its own glow, so it takes NO `logotype-*` /
 *    `neon-glow-*` class, and it no longer tracks `--glow-scale`. That is the
 *    same accepted cost as the hero and banner art.
 *  - BR-2.1 deliberately demoted the wordmark to a flat logotype on the grounds
 *    that "a logo has to read as print at 18px". The client's official mark is
 *    a fully-glowing neon lockup. That is his call, recorded as a decision
 *    rather than a regression — see docs/role-audit.md, BR-11.
 *  - `showCity` is now a no-op and "NEW YORK" is gone: the official lockup says
 *    VODKA, and a city line contradicts it. The prop is kept so existing
 *    call sites keep compiling.
 *  - `tone` is likewise kept but only "blue" exists as artwork; there is no
 *    pink set yet (see the TODO in Monogram.tsx).
 *
 * Sizing, two ways and only two:
 *  - pass `size` — the cap height of "BENNY RICH" in px, which is what it meant
 *    before, so old call sites land where they always did; or
 *  - pass a height in `className` (e.g. `h-7 w-auto`) and leave `size` unset,
 *    which is the only way to get a responsive height like `h-32 md:h-40`.
 * Passing `size` wins, because it is an inline style. Do not pass both.
 */
export function Wordmark({
  tone: _tone = "blue",
  layout = "stacked",
  size,
  showCity: _showCity = false,
  showTagline = false,
  className = "",
}: {
  /** Only "blue" has an asset; pink/mono fall back to it. */
  tone?: NeonTone;
  layout?: "stacked" | "inline";
  /** Cap height of the "BENNY RICH" letters, in px. Omit to size by className. */
  size?: number;
  /** No-op since BR-11 — the official lockup says VODKA, not a city. */
  showCity?: boolean;
  showTagline?: boolean;
  className?: string;
}) {
  const inline = layout === "inline";
  const asset = inline ? INLINE : LOCKUP;
  const capOfHeight = inline ? CAP_OF_HEIGHT.inline : CAP_OF_HEIGHT.lockup;
  const height = size === undefined ? undefined : size / capOfHeight;

  const image = (
    <img
      src={asset.src}
      alt="BennyRich"
      width={asset.width}
      height={asset.height}
      decoding="async"
      className={className || undefined}
      style={{ height, maxWidth: "100%", width: "auto" }}
    />
  );

  if (inline) return image;

  // Tagline sits under the lockup, so the stacked layout needs a column.
  if (!showTagline) return image;

  const taglineSize = size ?? 30;
  return (
    <span className="inline-flex flex-col items-center">
      {image}
      <span
        className="br-tagline"
        style={{
          fontSize: Math.max(9, taglineSize * 0.28),
          color: "var(--br-mute)",
          marginTop: taglineSize * 0.34,
          marginRight: "calc(var(--br-tracking-tagline) * -1)",
        }}
      >
        Timeless. Bold. Luxurious.
      </span>
    </span>
  );
}

/** Kept so the emphatic treatment stays available outside the lockups. */
export const wordmarkSignClass = textClass;
