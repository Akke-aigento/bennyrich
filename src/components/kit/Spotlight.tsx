/**
 * Spotlight — ambient light behind a hero section.
 *
 * BennyRich original (BR-4). No third-party source: see
 * src/components/kit/README.md for why the BR-3 vendored version was replaced.
 *
 * Two large elliptical washes pooled in the top corners, drifting against each
 * other on slightly different periods (14s / 18s) so the loop never lands on an
 * obvious beat. The brief is "a room with a window", not a searchlight — the
 * alphas are 5% and 3.5% of --br-blue, applied through color-mix so the light
 * rides --glow-scale like every other halo in the system.
 *
 * All motion is CSS (@keyframes br-spotlight-drift-a / -b in tokens.css), so
 * this ships no JavaScript and no animation library. Reduced motion pins both
 * washes to their rest position rather than letting the global duration crush
 * slam them to an end frame.
 *
 * Usage: the parent must be `relative overflow-hidden`, and siblings that
 * should sit above the light need `relative z-10`.
 */
import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("br-spotlight", className)}>
      <span className="br-spotlight-a" />
      <span className="br-spotlight-b" />
    </div>
  );
}
