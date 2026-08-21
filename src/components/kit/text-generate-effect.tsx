/**
 * TextGenerateEffect — vendored from Aceternity UI.
 * Source: https://ui.aceternity.com/components/text-generate-effect
 * Registry: https://ui.aceternity.com/registry/text-generate-effect.json
 *
 * Adapted for BennyRich:
 *  - `"use client"` stripped.
 *  - Upstream bakes in `font-bold`, `text-2xl`, `dark:text-white text-black`
 *    and an `mt-4` spacer. All removed — the component is now typographically
 *    neutral and inherits from the caller, so it can carry `br-tagline`
 *    (Inter, uppercase, .3em) without fighting it.
 *  - Blur-in reduced 10px -> 4px and the stagger 0.2s -> 0.12s: the words
 *    should settle, not swim into focus.
 *  - Reduced motion renders the finished text immediately (opacity 1, no
 *    blur) instead of letting the global CSS snap a 10px blur off in 0.001ms.
 *  - `useEffect` dependency list fixed: upstream depends on `[scope.current]`,
 *    a ref read that does not trigger re-runs.
 *  - Words are wrapped in inline-block spans so long taglines wrap cleanly at
 *    390px.
 */
import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.6,
  staggerDelay = 0.12,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
}) {
  const [scope, animate] = useAnimate();
  const reduced = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (reduced) return;
    animate(
      "span",
      { opacity: 1, filter: filter ? "blur(0px)" : "none" },
      { duration, delay: stagger(staggerDelay) },
    );
  }, [animate, duration, filter, reduced, staggerDelay, words]);

  return (
    <div ref={scope} className={cn(className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="inline-block whitespace-pre"
          style={{
            opacity: reduced ? 1 : 0,
            filter: filter && !reduced ? "blur(4px)" : "none",
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </div>
  );
}
