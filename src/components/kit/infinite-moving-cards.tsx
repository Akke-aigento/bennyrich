/**
 * InfiniteMovingCards — vendored from Aceternity UI.
 * Source: https://ui.aceternity.com/components/infinite-moving-cards
 * Registry: https://ui.aceternity.com/registry/infinite-moving-cards.json
 *
 * The mechanism is ported faithfully — duplicate the track, translate it -50%
 * on a linear loop, fade both edges with a mask, pause on hover. The card
 * markup is not: upstream ships a testimonial card (quote / name / title, grey
 * gradients, rounded-2xl) that has nothing to do with this brand.
 *
 * Adaptations:
 *  - `"use client"` stripped.
 *  - THE TAILWIND v3 -> v4 FIX. Upstream's `animate-scroll` class comes from a
 *    `keyframes` + `animation` block in tailwind.config.js. This project is
 *    Tailwind v4 and has no config file, so the @keyframes and the matching
 *    `@utility br-marquee-track` live in src/styles/kit.css instead — the same
 *    mechanism tokens.css already uses. That is the general porting rule for
 *    any Aceternity component that animates: the class comes from CSS, not
 *    from a config extend.
 *  - SSR FIX. Upstream duplicates the track in a useEffect by cloneNode-ing
 *    every child into the DOM after mount, and gates the animation behind a
 *    `start` state. Under TanStack Start's SSR that means the server renders a
 *    half-width, unanimated track and hydration visibly jumps. Here the array
 *    is doubled at render and the CSS custom properties are set inline, so
 *    first paint is already correct.
 *  - `items` is `{ label }[]` rather than `{ quote, name, title }[]`.
 *  - Speeds slowed throughout (upstream fast/normal/slow = 20/40/80s; here
 *    48/80/120s) and `speed` defaults to "slow".
 *
 * !! This component MOVES. The design system currently says the header is the
 *    one exception to "no movement" (CLAUDE.md). Adopting this beyond /kit
 *    needs an explicit amendment — see docs/design-kit.md.
 */
import { cn } from "@/lib/utils";

const DURATIONS = { fast: "48s", normal: "80s", slow: "120s" } as const;

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: { label: string }[];
  direction?: "left" | "right";
  speed?: keyof typeof DURATIONS;
  pauseOnHover?: boolean;
  className?: string;
}) {
  // Rendered twice so the -50% translate loops seamlessly. aria-hidden on the
  // second pass keeps screen readers from reading the list out twice.
  return (
    <div
      className={cn(
        "relative z-20 w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]",
        className,
      )}
      style={
        {
          "--marquee-duration": DURATIONS[speed],
          "--marquee-direction": direction === "left" ? "forwards" : "reverse",
        } as React.CSSProperties
      }
    >
      <ul
        className={cn(
          "br-marquee-track flex w-max min-w-full shrink-0 flex-nowrap items-center gap-12 py-4",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {[...items, ...items].map((item, idx) => (
          <li
            key={`${item.label}-${idx}`}
            aria-hidden={idx >= items.length}
            className="br-label shrink-0 whitespace-nowrap"
            style={{ color: "var(--br-mute)" }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
