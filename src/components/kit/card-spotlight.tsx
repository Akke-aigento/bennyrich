/**
 * CardSpotlight — vendored from Aceternity UI, PARTIAL PORT.
 * Source: https://ui.aceternity.com/components/card-spotlight
 * Registry: https://ui.aceternity.com/registry/card-spotlight.json
 *
 * !! The upstream component has a registry dependency on CanvasRevealEffect,
 *    which imports `three` and `@react-three/fiber` to render an animated
 *    dot-matrix inside the hover mask. That layer is DELIBERATELY NOT PORTED:
 *
 *      1. ~600KB of WebGL for a hover decoration on a storefront is not a
 *         trade this project should make.
 *      2. The dot matrix animates continuously, which contradicts the design
 *         system's "nothing pulses / no glow is ever animated" (CLAUDE.md).
 *
 *    What remains — the mouse-following radial mask — is exactly the effect
 *    BR-3 asked for. Do not "restore" the canvas without re-reading both
 *    points above.
 *
 * Other adaptations:
 *  - `"use client"` stripped.
 *  - Upstream's #262626 fill replaced with a color-mix() over --br-blue at 14%,
 *    so the follow reads as a blue breath rather than a grey smudge and tracks
 *    the brand token.
 *  - useMotionTemplate hoisted out of the JSX `style` prop (it is a hook).
 *  - Baked-in `p-10`, `bg-black` and neutral borders removed: the shell is now
 *    unstyled apart from the hairline, so callers control padding and ground.
 *  - Radius uses var(--radius) (2px project-wide) instead of rounded-md.
 *
 * The effect is opacity-only, which the design system permits, so it is left
 * on under reduced motion; the global prefers-reduced-motion block in
 * tokens.css already collapses the 200ms fade.
 */
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

export function CardSpotlight({
  children,
  radius = 320,
  color = "color-mix(in srgb, var(--br-blue) 14%, transparent)",
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent 80%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn("group/spotlight border-br-line relative border", className)}
      style={{ borderRadius: "var(--radius)" }}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-200 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: color,
          borderRadius: "var(--radius)",
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      />
      {children}
    </div>
  );
}
