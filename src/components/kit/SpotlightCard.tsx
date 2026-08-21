/**
 * SpotlightCard — a cursor-following blue breath behind card content.
 *
 * BennyRich original (BR-4). No third-party source; see
 * src/components/kit/README.md.
 *
 * The pointer position is written to --br-mx / --br-my as CSS custom
 * properties on the wrapper, coalesced to one write per frame through
 * requestAnimationFrame. A single pointer-events-none layer reads those
 * properties in a radial-gradient; everything else — the 200ms fade in and out,
 * the 14% blue — is CSS. No animation library, no canvas, no WebGL.
 *
 * The glow sits BEHIND the children (z-0 vs z-10), so on a ProductCard it
 * breathes in the gutter around the opaque .br-media well and behind the
 * caption, rather than tinting the product photograph.
 *
 * Deliberately borderless and padding-free by default: ProductCard already
 * draws its own hairline and lights it blue on hover, and a second border
 * would double it. Pass `bordered` for a standalone card.
 */
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCard({
  children,
  className,
  bordered = false,
  ...props
}: {
  children: React.ReactNode;
  /** Draw a --br-line hairline. Off by default — most callers have their own. */
  bordered?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const point = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top } = el.getBoundingClientRect();
    point.current = { x: event.clientX - left, y: event.clientY - top };

    // One style write per frame, however fast the pointer moves.
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const node = ref.current;
      if (!node) return;
      node.style.setProperty("--br-mx", `${point.current.x}px`);
      node.style.setProperty("--br-my", `${point.current.y}px`);
    });
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn("br-spotlight-card", bordered && "border-br-line border", className)}
      {...props}
    >
      <span aria-hidden className="br-spotlight-card-glow" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
