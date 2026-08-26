export type NeonTone = "blue" | "pink" | "mono";

/** How brightly a mark burns. Lockups use "logotype"; signage uses "sign". */
export type MarkIntensity = "sign" | "logotype";

const glowByIntensity: Record<MarkIntensity, Record<NeonTone, string>> = {
  sign: { blue: "neon-glow-blue", pink: "neon-glow-pink", mono: "" },
  logotype: { blue: "logotype-glow-blue", pink: "logotype-glow-pink", mono: "" },
};

export const glowClass: Record<NeonTone, string> = glowByIntensity.sign;

/** Official monogram crop: 157x136, with the ring 101px across inside it. */
const ASSET = {
  src: "/brand/logo-monogram-blue.png",
  width: 157,
  height: 136,
  /** Ring diameter as a fraction of the crop's height. */
  ringOfHeight: 101 / 136,
};

/**
 * BennyRich monogram — the BR ring.
 *
 * Since BR-11 this is the client's official artwork (`public/brand/`), not the
 * hand-drawn SVG. It is a raster that carries its own glow, so it takes NO
 * neon/logotype filter on top of it, and it no longer tracks `--glow-scale` —
 * the same accepted cost as the hero and banner art.
 *
 * `size` still means what it always did: the RING's diameter. The old SVG ring
 * was r=45 in a 100 box; this crop's ring is 101/136 of its height, so the
 * image is scaled to match rather than being dropped in at `size` square.
 *
 * TODO(pink): there is no pink asset yet, so `tone="pink"` keeps the drawn SVG
 * below. Run `docs/brand/tools/neon_alpha.py` over `docs/brand/logo-pink.jpg`
 * to produce `logo-monogram-pink.png` and this branch can go.
 */
export function Monogram({
  tone = "blue",
  size = 40,
  intensity = "sign",
  className = "",
  title,
}: {
  tone?: NeonTone;
  size?: number | string;
  intensity?: MarkIntensity;
  className?: string;
  title?: string;
}) {
  if (tone === "pink") {
    return (
      <DrawnMonogram
        tone={tone}
        size={size}
        intensity={intensity}
        className={className}
        title={title}
      />
    );
  }

  // `size` is the ring; derive the box the ring lives in.
  const numeric = typeof size === "number" ? size : Number.parseFloat(size);
  const height = Number.isFinite(numeric) ? numeric / ASSET.ringOfHeight : undefined;
  const width = height ? (height * ASSET.width) / ASSET.height : undefined;

  return (
    <img
      src={ASSET.src}
      alt={title ?? ""}
      width={ASSET.width}
      height={ASSET.height}
      decoding="async"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      style={{ height, width, maxWidth: "100%" }}
    />
  );
}

/**
 * The hand-drawn mark, kept only for `tone="pink"` (the 18+ gate) until a pink
 * asset exists. A hairline circle enclosing an overlapping serif "B" and "R",
 * stroked in `currentColor` so the neon utilities light it up.
 */
function DrawnMonogram({
  tone,
  size,
  intensity,
  className,
  title,
}: {
  tone: NeonTone;
  size: number | string;
  intensity: MarkIntensity;
  className: string;
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
      className={`${glowByIntensity[intensity][tone]} ${className}`.trim()}
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
