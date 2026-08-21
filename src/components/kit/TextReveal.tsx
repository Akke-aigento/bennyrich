/**
 * TextReveal — word-by-word settle for a tagline.
 *
 * BennyRich original (BR-4). No third-party source; see
 * src/components/kit/README.md.
 *
 * Each direct child gets the `br-reveal-part` class and an index, and CSS does
 * the rest: blur(4px) -> 0, a 0.35em rise and a fade, 0.6s each, staggered
 * 0.12s apart (@keyframes br-reveal-settle in tokens.css). The words should
 * settle, not swim.
 *
 * WHY IT CLONES RATHER THAN WRAPS. The house tagline is three lines carrying
 * three different neon utilities (neon-hero-white / -blue / -pink). Wrapping
 * each in an extra span would either break `display: block` or fight the
 * colour class, so the animation class is merged onto the caller's own element.
 * That also means TextReveal renders no wrapper of its own and is legal
 * anywhere its children are — including directly inside an <h1>.
 *
 * Runs ONCE, on mount. A CSS animation with `fill-mode: both` plays a single
 * time and holds its end state; there is no replay control and nothing here
 * loops, so "nothing pulses" is preserved. Under reduced motion the animation
 * is switched off entirely and the text renders in its final state — not
 * snapped through a crushed duration.
 */
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealChildProps = { className?: string; style?: React.CSSProperties };

export function TextReveal({
  children,
  /** Seconds between one child settling and the next. */
  stagger = 0.12,
  /** Seconds for a single child to settle. */
  duration = 0.6,
}: {
  children: ReactNode;
  stagger?: number;
  duration?: number;
}) {
  return (
    <>
      {Children.map(children, (child, index) => {
        if (!isValidElement<RevealChildProps>(child)) return child;
        return cloneElement(child, {
          className: cn(child.props.className, "br-reveal-part"),
          style: {
            ...child.props.style,
            "--br-reveal-i": index,
            "--br-reveal-stagger": `${stagger}s`,
            "--br-reveal-duration": `${duration}s`,
          } as React.CSSProperties,
        });
      })}
    </>
  );
}
