# Design kit — how to get a third-party look into a tenant storefront

**Status:** BR-4, shipped. The homepage uses three effect components that are
**our own code**: `Spotlight`, `SpotlightCard`, `TextReveal` in
`src/components/kit/`. Nothing third-party remains in the repository.

This document is the **reusable workflow artifact**. BennyRich is the worked
example; _The reuse pattern_ at the end is the part meant to travel.

The headline lesson, learned the expensive way:

> **Vendoring third-party component source into a client-owned repo is a
> licence problem, not a convenience.** Use the vendored copy to _decide_, then
> write your own to _ship_. The evaluation is worth doing; the source is not
> worth keeping.

---

## 1. What actually shipped

| Component       | What it does                                | Deps |
| --------------- | ------------------------------------------- | ---- |
| `Spotlight`     | Two ambient blue washes drifting behind the hero | none |
| `SpotlightCard` | Cursor-following blue breath on a product card   | none |
| `TextReveal`    | Word-by-word settle on the house tagline         | none |

All three are plain CSS plus a few lines of React. Keyframes live in
`src/styles/tokens.css`; the components are documented in
`src/components/kit/README.md`.

**A marquee was evaluated and cut.** It never stops moving, which the design
system forbids outside the header, and no one could justify amending the rule
for it.

---

## 2. The licence finding — the reason for all of the above

BR-3 vendored five components from [Aceternity UI](https://ui.aceternity.com)
to evaluate the look. Checked at source on 2026-08-21:

- `https://ui.aceternity.com/licence` presents a single proprietary "Aceternity
  License" covering "each item available for **purchase or download**" on the
  site. It draws **no distinction between free and Pro** components.
- It explicitly forbids redistributing an item "as a stock image or its source
  files, **regardless of modifications**", and forbids distributing items or
  derivative works "on any marketplace".
- The registry JSON carries an `author` field and **no licence field at all**.
- The public repo `manuarora700/ui.aceternity` has **no LICENSE file**.
- Third-party blogs and directory listings widely assert "MIT". **None cites an
  Aceternity source, and no primary source supports it.**

**What that means.** Using the components inside a delivered storefront is their
intended use and is not prohibited. What is prohibited is redistributing the
source — and a repo that syncs to Lovable and may be handed to a client is
redistribution, or close enough that no one wanted to argue it in front of the
client.

BennyRich requires zero paid dependencies **and** zero licence grey area. So
BR-4 kept the approved look and rewrote the code from a written spec. Nothing
was copied from Aceternity **Pro**, which is a paid, strictly
non-redistributable tier, at any point.

> The vendor's name is kept **out of `src/` on purpose**, so that
> `grep -ri aceternity src/` works as a standing check that no vendored source
> has crept back in. It currently returns 0 hits.

---

## 3. Writing your own turned out to be cheaper than vendoring

This is the part that was genuinely surprising, and it is the strongest argument
for the pattern.

**All three effects are expressible in plain CSS.** The vendored versions needed
`motion` (the package formerly published as `framer-motion`) — BR-3 measured it
at ~35–50 KB gzipped **on every route**, and flagged "is it worth it?" as an open
question for BR-4. Rewriting answered the question by removing it:

| | BR-3 (vendored) | BR-4 (ours) |
| --- | --- | --- |
| Runtime deps | `motion@13.1.0` | none |
| Server bundle | `framer-motion+[…].mjs` 370 KB / 96.6 KB gz | gone |
| JS in the components | full animation runtime | one `rAF` pointer handler |
| Licence to carry | proprietary, redistribution forbidden | ours |

The mechanisms are not exotic once you look at them plainly:

- **Ambient light** is two `radial-gradient` ellipses and a `@keyframes` that
  translates them. Give the two layers *different* periods (14s and 18s) so the
  pair never lands on a visible beat.
- **A cursor-following glow** is two custom properties written on `pointermove`,
  read by one `radial-gradient`, faded with a `transition`. Coalesce the writes
  with `requestAnimationFrame` and it costs one style write per frame.
- **A staggered reveal** is `animation-delay: calc(var(--i) * .12s)` with
  `animation-fill-mode: both`. It runs once and holds, for free — no mount
  effect, no orchestration, and it starts at first paint instead of waiting for
  hydration.

If you find yourself installing an animation library for effects at this level,
check the CSS first.

---

## 4. Stack findings (TanStack Start + Vite + Tailwind v4)

Still true, and still the part that costs time on a new tenant.

### Tailwind v4 has no config file

`tailwindcss@4.2.1` via `@tailwindcss/vite`, CSS-first, **no
`tailwind.config.js`**. Theme in `src/styles.css` (`@theme inline`), tokens and
utilities in `src/styles/tokens.css`.

> **Porting rule.** Anything a v3-era component declares _in_
> `tailwind.config.js` has nowhere to land. The v4 equivalent of a
> `theme.extend.keyframes` + `theme.extend.animation` pair is a plain
> `@keyframes` block plus an `@utility`.

### `@utility` cannot style descendants

`@utility` defines one class. Components with internal structure need plain
class rules — which `tokens.css` already uses for `.br-media`, and which the
BR-4 components use for `.br-spotlight > span`. Reach for `@utility` only when
the thing really is a single composable utility.

### Don't set `display` in a class you merge onto a caller's element

`TextReveal` merges `br-reveal-part` onto the caller's own `<span class="block">`.
Had `.br-reveal-part` set `display`, it would have silently beaten Tailwind's
`.block` — both are single-class selectors, and `tokens.css` is imported *after*
Tailwind, so source order decides. Merge-in classes should carry animation and
nothing structural.

### Reduced motion must be handled by name, not by duration

`tokens.css` has a global block crushing `animation-duration` to `0.001ms`. It
is a good backstop, but on its own it makes an animation **snap** to its end
frame rather than not play — a drift freezing at one extreme, a blur slamming
off. Every component also needs an explicit `animation: none`, placed *after*
the global block so it wins without `!important`.

Verified on the shipped homepage under emulated `prefers-reduced-motion: reduce`:
`animation-name` is `none` on both the spotlight and the reveal, and the reveal
renders `opacity: 1; filter: none; transform: none`.

### The CLI is not the way in

`npx shadcn add @aceternity/...` was rejected on four counts: `components.json`
has `"registries": {}`; the payload is Next.js-shaped (`"use client"`,
`next/image`, `next/link`); the CLI's Tailwind step wants a config file to
extend; and `card-spotlight` carries a **registry dependency** on
`canvas-reveal-effect`, which pulls in `three` and `@react-three/fiber` — about
600 KB of WebGL, installed without comment, for a hover decoration.

**Read the registry JSON instead**, at
`https://ui.aceternity.com/registry/<name>.json`. `.files[].content` holds the
source; `.dependencies` and `.registryDependencies` tell you what it drags along
*before* you commit to it. That is how the `three` dependency was caught, and
`registryDependencies` is the single most useful early-warning signal there is.

---

## 5. Capturing the evidence

Full-page screenshots at real device sizes are harder than they look. Four
approaches were tried and rejected before one worked:

1. **`--window-size`** does not set the *emulated* viewport, so media queries and
   `vh` units resolve against the wrong box.
2. **`captureBeyondViewport`** ghosts the footer at the page origin.
3. **Resizing the viewport to the page height** inflates the layout, because
   `br-section` padding is `clamp(80px, 12vh, 160px)` — a 3200px viewport grows
   the page by hundreds of pixels *as you measure it*.
4. **Priming the scroll range** (scroll to the bottom, then back to top, to warm
   the compositor) leaves a **stale footer tile ghosted over the hero**. This was
   BR-4's own discovery, arrived at while trying to fix (2). Tile 0 must be taken
   on a page that has never been scrolled.

What works: emulate the device with `Emulation.setDeviceMetricsOverride`,
navigate to `about:blank` between devices to blank the compositor, settle on
`load` + `document.fonts.ready` + two `rAF`s, then tile down the page at exactly
the viewport height and stitch. **Hide `position: sticky` headers on every tile
after the first** (`visibility`, not `display`, so they keep their place in the
flow) or the header is stitched in once per tile.

---

## 6. The reuse pattern for future tenants

> **Vendor to decide. Write your own to ship.**

1. **Check the licence at source, per library, before anything else.** Do not
   trust the ecosystem's "it's MIT" — see §2. If the client will own the repo and
   the licence forbids redistributing source, you already know you are writing
   your own; the only question is whether the look is worth it.
2. **Pull from the registry JSON, not the web page.** Component pages render
   their code client-side, so fetching the HTML gets you nothing. Read
   `.registryDependencies` first.
3. **Prove the look on one throwaway route** — out of the nav, `noindex`, static
   data so screenshots need no API. Get an explicit sign-off on *which*
   components, before writing anything real.
4. **Then throw the vendored code away and write it from a spec**, not from the
   source. Describe the effect in words — colours as tokens, distances, periods,
   rest states — and implement against the description.
5. **Try CSS first.** Ambient light, cursor glows and staggered reveals do not
   need an animation library (§3). Budget the library only if something genuinely
   needs orchestration.
6. **Recolour to tenant tokens through `color-mix`,** never hardcoded `rgba()`.
   If the tenant has a global intensity knob — BennyRich has `--glow-scale` — the
   components must ride it, or they drift out of tune the moment anyone turns it.
7. **Restraint pass, ~40%.** These looks are built for louder brands than most
   maison-tier clients. Cut alphas, shorten travel, lengthen durations.
8. **Audit for SSR hazards.** `Math.random()` / `Date.now()` in a render body,
   and post-mount DOM mutation. Both were present in the vendored set.
9. **Handle reduced motion in JS or by animation-name, not by duration** (§4).
10. **Header-comment every file** with what it does and why, especially
    deliberate omissions — otherwise future-you "fixes" the WebGL layer back in.
11. **Keep the rejected vendor's name out of `src/`,** so a one-line `grep` is a
    standing check that the source has not crept back.

### Worth knowing for next time

- **Magic UI is MIT-licensed** and overlaps heavily with Aceternity. If you want
  a vendored component you can actually ship the source of, start there.
- The evaluation step is still worth its cost even though the code is discarded.
  Deciding "spotlight yes, marquee no" from a live page took minutes; arguing it
  from screenshots would have taken a week.
- Rewriting three components from spec took less time than porting five had.
