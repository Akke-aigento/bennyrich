import pantherSvg from "./panther.svg?raw";
import shhKidSvg from "./shh-kid.svg?raw";

/**
 * The line-art pieces are authored as plain SVG files (single source of truth)
 * and inlined here rather than loaded through <img>, so their strokes inherit
 * `currentColor` and the neon glow filter applies to the artwork itself.
 *
 * `rifle.svg` also lives in this folder but is deliberately not wired up: it
 * read as a club flyer on the homepage banner and is not ad-safe. To bring it
 * back on a product page, import it the same way the panther is imported here.
 */
function InlineArt({
  markup,
  label,
  className = "",
}: {
  markup: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`[&>svg]:h-auto [&>svg]:w-full ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

/** The BennyRich kid: bucket hat, face in shadow, finger to the lips. */
export function ShhKid({ className = "" }: { className?: string }) {
  return (
    <InlineArt
      markup={shhKidSvg}
      label="The BennyRich kid in a BENNYRICH bucket hat, finger held to his lips"
      className={`neon-glow-blue ${className}`.trim()}
    />
  );
}

/** Reclining panther used on the "Built different" banner. */
export function Panther({ className = "" }: { className?: string }) {
  return (
    <InlineArt
      markup={pantherSvg}
      label="Neon line drawing of a reclining panther"
      className={`neon-glow-blue ${className}`.trim()}
    />
  );
}
