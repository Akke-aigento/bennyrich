# `src/components/kit/` — BennyRich's own effect components

Three small components that add **light and pacing** to the storefront:
`Spotlight`, `SpotlightCard`, `TextReveal`. They are used on the homepage
(`src/routes/index.tsx`).

**These are our own implementations.** No third-party source, no vendored files,
no licence to carry. Written from scratch in BR-4 against a written spec, not
adapted from anyone's component.

## Dependencies: none

All three are **plain CSS plus a few lines of React**. No animation library, no
canvas, no WebGL, nothing at runtime beyond React itself.

`SpotlightCard` is the only one with any JavaScript at all: a pointer handler
that writes two custom properties, coalesced to one write per frame with
`requestAnimationFrame`. Everything else — the drift, the fades, the reveal
stagger — is `@keyframes` and `transition`.

The backing CSS lives in **`src/styles/tokens.css`**, under
`--- Ambient light + reveal (BR-4) ---`. It is in the design system rather than
a separate stylesheet precisely because these components are ours: there is no
longer a third-party trial to keep quarantined behind one deletable `@import`.

## Why the BR-3 versions were replaced

BR-3 vendored four components from [Aceternity UI](https://ui.aceternity.com)
into this folder to evaluate the look. The evaluation succeeded — the spotlight,
the card glow and the tagline reveal were all approved — but the **source could
not ship**.

Aceternity's free components are **not MIT-licensed**, contrary to what most of
the ecosystem repeats. Their licence covers every item "available for purchase
or download" and forbids redistributing an item's source files "regardless of
modifications". Using the components in a delivered site is their intended use;
**shipping their source inside a repo that syncs to Lovable and may be handed to
a client is not.** The full research is in `docs/design-kit.md` §2.

So BR-4 kept the approved *look* and rewrote the *code*. Nothing
Aceternity-derived remains in this repository — `grep -ri aceternity src/`
returns nothing.

Dropping the vendored code also let `motion` go. BR-3 flagged it as ~35–50 KB
gzipped on every route; all three effects turned out to be expressible in CSS,
so the dependency was removed outright rather than paid for.

## House rules these follow

1. **No hardcoded colour.** Every alpha is
   `color-mix(in srgb, var(--br-…) N%, transparent)`, so the components ride
   `--glow-scale` with the rest of the system.
2. **One accent per component.** All three are blue. Pink stays on emphasis
   words, sale states and pink-variant products.
3. **Nothing pulses.** `TextReveal` runs once on mount and holds. The card glow
   is a hover transition. The only continuous motion is the spotlight drift,
   which is ambient *light*, not an animated glow — 60px over 14–18s.
4. **Reduced motion is handled by name, not by duration.** `tokens.css` has a
   global block that crushes `animation-duration` to `0.001ms`. That is a good
   backstop but on its own it makes an animation *snap*. Each component also has
   an explicit `animation: none` rule so it renders its rest state.
5. **Radius never exceeds 2px** (`var(--radius)`).
6. **SSR-safe.** No `Math.random()` or `Date.now()` in a render body, no
   post-mount DOM mutation, and the pointer custom properties have `50%`
   fallbacks so first paint is correct before any pointer event.

## Adding another

Write it here, in CSS first. If you find yourself reaching for an animation
library, check whether `@keyframes` plus a custom property does the job — for
all three of these, it did. Put the keyframes in `tokens.css` alongside the
others, header-comment the file with what it does and why, and keep to the six
rules above.
