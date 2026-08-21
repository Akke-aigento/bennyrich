# `src/components/kit/` — vendored design kit (under evaluation)

These are **third-party components from [Aceternity UI](https://ui.aceternity.com),
copied into this repo and adapted in place**. They are on trial for BR-4 and are
shown only on `/kit`. Nothing in `src/components/site/` depends on them.

They are **not part of the BennyRich design system.** The design system is
`src/styles/tokens.css` and the rules in `CLAUDE.md`. If the two disagree, the
design system wins.

## Why vendored by hand and not `npx shadcn add`

`npx shadcn add @aceternity/...` is not viable on this stack:

1. `components.json` has `"registries": {}` — the `@aceternity` namespace is not
   registered, so the command does not resolve as written.
2. The payload is Next.js-shaped: `"use client"` directives and `next/*` imports.
3. The CLI's Tailwind step expects a `tailwind.config.js` to extend. This project
   is Tailwind v4, CSS-first, and has no config file.
4. `card-spotlight` carries a registry dependency on `canvas-reveal-effect`,
   which pulls in `three` and `@react-three/fiber`.

The sources were taken from the shadcn registry JSON, which does serve the real
files — e.g. `https://ui.aceternity.com/registry/spotlight-new.json`.

## The port recipe

Applied to every file here. Follow it if you add another.

1. Strip `"use client"`; replace `next/image` with `<img>` and `next/link` with
   `Link` from `@tanstack/react-router`.
2. Leave `import { cn } from "@/lib/utils"` alone — Aceternity's alias happens to
   match ours exactly.
3. **Recolour to tokens.** No hardcoded hex survives. Colours become
   `var(--br-blue)` / `var(--br-pink)` / `var(--br-black)`; alphas become
   `color-mix(in srgb, var(--br-…) N%, transparent)` so the component tracks
   `--glow-scale` like everything else.
4. **Restraint pass, roughly −40%.** Cut glow alphas, shorten travel distances,
   lengthen durations. Luxury is restraint; these components ship tuned for a
   much louder aesthetic than this brand's.
5. **Honour reduced motion in JS**, via `useReducedMotion()`, and render the
   finished state. The global `prefers-reduced-motion` block in `tokens.css`
   crushes durations to `0.001ms`, which makes an un-guarded animation _snap_
   rather than not play.
6. **Animation classes come from CSS, not a config extend** — `@keyframes` plus
   `@utility` in `src/styles/kit.css`. That is the v3→v4 translation.
7. **Check for SSR hazards**: `Math.random()` or `Date.now()` in a render body,
   and post-mount DOM mutation. Both were present upstream and both are fixed
   here.

## What is in here

| File                        | Port           | Note                                                                                                           |
| --------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `spotlight-new.tsx`         | complete       | Ambient blue hero light.                                                                                       |
| `card-spotlight.tsx`        | **partial**    | Canvas dot-matrix layer deliberately dropped — see the file header before restoring it.                        |
| `text-generate-effect.tsx`  | complete       | Typographically neutral; inherits from the caller.                                                             |
| `infinite-moving-cards.tsx` | mechanism only | Card markup rewritten; **this component moves**, which the design system currently forbids outside the header. |
| `background-beams.tsx`      | complete       | **Parked and unused**, kept ready for a BR-4 trial.                                                            |

See `docs/design-kit.md` for the licence position — it is **not** MIT, and that
matters if this pattern is reused for client work.
