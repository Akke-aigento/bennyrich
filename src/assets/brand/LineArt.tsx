import rifleSvg from "./rifle.svg?raw";
import shhKidSvg from "./shh-kid.svg?raw";

/**
 * The line-art pieces are authored as plain SVG files (single source of truth)
 * and inlined here rather than loaded through <img>, so their strokes inherit
 * `currentColor` and the neon glow filter applies to the artwork itself.
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

/** Rifle line art used on the "Built different" banner. */
export function Rifle({ className = "" }: { className?: string }) {
  return (
    <InlineArt
      markup={rifleSvg}
      label="Neon line drawing of a rifle with the BennyRich monogram on the grip"
      className={`neon-glow-pink ${className}`.trim()}
    />
  );
}
