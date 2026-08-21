/**
 * Spotlight — vendored from Aceternity UI ("Spotlight New").
 * Source: https://ui.aceternity.com/components/spotlight-new
 * Registry: https://ui.aceternity.com/registry/spotlight-new.json
 *
 * See src/components/kit/README.md for the port recipe and the licence
 * position. Adapted for BennyRich:
 *
 *  - `"use client"` stripped (TanStack Start, not Next.js).
 *  - Upstream's hsla(210, …) gradients replaced with color-mix() over
 *    --br-blue, so the light tracks the brand token rather than a hardcoded
 *    hue.
 *  - Alphas cut ~40% (.08/.06/.04 -> .05/.035/.025) and the drift slowed from
 *    7s to 14s with a smaller travel (100px -> 60px): ambient light in a dark
 *    room, not a searchlight.
 *  - z-40 -> z-0. Upstream stacks the beams above page content; here they sit
 *    behind it.
 *  - w-screen -> w-full so a contained hero cannot open a horizontal scrollbar.
 *  - `drift` prop + useReducedMotion(): the beams render static rather than
 *    snapping when motion is reduced.
 */
import { motion, useReducedMotion } from "motion/react";

/** A blue wash at the given strength, derived from the brand token. */
const wash = (pct: number) => `color-mix(in srgb, var(--br-blue) ${pct}%, transparent)`;

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
  /** Set false to hold the beams still. Reduced motion forces this off. */
  drift?: boolean;
};

export function Spotlight({
  gradientFirst = `radial-gradient(68.54% 68.72% at 55.02% 31.46%, ${wash(5)} 0, ${wash(1.5)} 50%, transparent 80%)`,
  gradientSecond = `radial-gradient(50% 50% at 50% 50%, ${wash(3.5)} 0, ${wash(1.2)} 80%, transparent 100%)`,
  gradientThird = `radial-gradient(50% 50% at 50% 50%, ${wash(2.5)} 0, ${wash(1)} 80%, transparent 100%)`,
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 14,
  xOffset = 60,
  drift = true,
}: SpotlightProps = {}) {
  const reduced = useReducedMotion();
  const moving = drift && !reduced;

  const sweep = (dir: 1 | -1) =>
    moving
      ? {
          animate: { x: [0, dir * xOffset, 0] },
          transition: {
            duration,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut" as const,
          },
        }
      : {};

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    >
      <motion.div
        {...sweep(1)}
        className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 left-0"
        />
        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 left-0 origin-top-left"
        />
        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 left-0 origin-top-left"
        />
      </motion.div>

      <motion.div
        {...sweep(-1)}
        className="pointer-events-none absolute top-0 right-0 z-0 h-full w-full"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 right-0"
        />
        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 right-0 origin-top-right"
        />
        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 right-0 origin-top-right"
        />
      </motion.div>
    </motion.div>
  );
}
