# Design kit — vendoring third-party components into a tenant storefront

**Status:** BR-3, evaluation only. Nothing on the live BennyRich storefront uses
any of this yet. The rollout decision is BR-4's, pending Akke + Sander sign-off
on `/kit`.

This document is the **reusable workflow artifact**. The BennyRich specifics are
here as a worked example, but the method in _The reuse pattern_ at the end is
the part meant to travel to the next tenant.

---

## 1. What was brought in

All five come from [Aceternity UI](https://ui.aceternity.com). They live in
`src/components/kit/` and are shown on `/kit`.

| Component             | Source                                                                              | Port                 | Role                                    |
| --------------------- | ----------------------------------------------------------------------------------- | -------------------- | --------------------------------------- |
| `Spotlight`           | [spotlight-new](https://ui.aceternity.com/components/spotlight-new)                 | complete             | Ambient blue light behind the hero      |
| `CardSpotlight`       | [card-spotlight](https://ui.aceternity.com/components/card-spotlight)               | **partial**          | Cursor-following glow on a product card |
| `TextGenerateEffect`  | [text-generate-effect](https://ui.aceternity.com/components/text-generate-effect)   | complete             | Tagline reveal                          |
| `InfiniteMovingCards` | [infinite-moving-cards](https://ui.aceternity.com/components/infinite-moving-cards) | mechanism only       | Slow marquee strip                      |
| `BackgroundBeams`     | [background-beams](https://ui.aceternity.com/components/background-beams)           | complete, **unused** | Parked for a BR-4 trial                 |

Chosen on the principle that **subtle beats flashy**. Aceternity's catalogue is
mostly built for loud landing pages — 3D tilt cards, meteor showers, glare
effects, animated gradient borders. Those were skipped on sight. What survived
is the set that adds _light and pacing_ rather than spectacle, because that is
what "signage seen from across a quiet room" needs.

---

## 2. Licence — read this before reusing the pattern

**The free Aceternity components are not MIT-licensed, despite what most of the
ecosystem says.** This was checked at source on 2026-08-21:

- `https://ui.aceternity.com/licence` presents a single proprietary "Aceternity
  License" covering "each item available for **purchase or download**" on the
  site. It draws no distinction between free and Pro components.
- That licence explicitly forbids re-distributing an item "as a stock image or
  its source files, regardless of modifications", and forbids selling or
  distributing items or derivative works "on any marketplace".
- The registry JSON carries an `author` field (Manu Arora) and **no licence
  field at all**.
- The public repo `manuarora700/ui.aceternity` has **no LICENSE file**.
- Third-party blog posts and directory listings widely assert "MIT". None of
  them cite an Aceternity source, and no primary source supports it.

**What this means in practice.** Using the components inside a delivered
storefront is their intended use and is not prohibited. What _is_ prohibited is
redistributing the source — which is what `src/components/kit/` is, in a repo
that syncs to Lovable and may be handed to a client.

**Open question for Akke, before this pattern is reused on a paying tenant:**
this repo is private and the components are used, not resold, so BR-3 is on
comfortable ground. A future engagement where the client takes ownership of the
repo is less obviously fine. If the answer needs to be firm, ask Aceternity
directly, or prefer a genuinely MIT-licensed source — **Magic UI is MIT** and
covers a lot of the same ground.

Nothing in this batch was copied from Aceternity **Pro**, which is a paid,
strictly non-redistributable tier.

---

## 3. Stack findings (TanStack Start + Vite + Tailwind v4)

### Tailwind is v4 — mostly good news

`tailwindcss@4.2.1` via `@tailwindcss/vite`, CSS-first, **no
`tailwind.config.js`**. Theme in `src/styles.css` (`@theme inline`), brand
tokens and utilities in `src/styles/tokens.css`.

Aceternity targets v4, so **no utility classes needed rewriting** — no
`bg-opacity-*`, no v3 arbitrary-value syntax. The catch is the inverse:

> **Porting rule.** Anything Aceternity declares _in_ `tailwind.config.js` has
> nowhere to land in a v4 project. `InfiniteMovingCards` uses an
> `animate-scroll` class that comes from a `theme.extend.keyframes` +
> `theme.extend.animation` block. The v4 equivalent is a plain `@keyframes`
> plus an `@utility`, which is what `src/styles/kit.css` now holds.

Had this been Tailwind v3, the work would have been the other way round: the
config would take the keyframes, and the components' v4-era class syntax would
need auditing instead.

### CLI vs manual: manual, and not close

`npx shadcn add @aceternity/...` was rejected for four reasons:

1. `components.json` has `"registries": {}`. The `@aceternity` namespace is not
   registered, so the command does not resolve as written.
2. The payload is Next.js-shaped — `"use client"` directives, `next/image`,
   `next/link`. This is TanStack Start.
3. The CLI's Tailwind step expects a `tailwind.config.js` to extend. There is
   none.
4. `card-spotlight` carries a **registry dependency** on `canvas-reveal-effect`,
   which imports `three` and `@react-three/fiber`. The CLI would have installed
   both without comment.

One thing would have worked for free either way: Aceternity imports `cn` from
`@/lib/utils`, which is exactly this project's alias. That import needed no
change in any file.

**The registry JSON is the good way in.** The component pages render their code
client-side, so fetching the HTML gets you nothing. The shadcn registry endpoint
serves the real file contents as JSON:

```
https://ui.aceternity.com/registry/<component-name>.json
```

`.files[].content` holds the source; `.dependencies` and `.registryDependencies`
tell you what it drags along _before_ you commit to it. That is how the
`three` dependency was caught.

### One new runtime dependency

`motion@13.1.0` (the package formerly published as `framer-motion`; `motion/react`
is a straight `export *` from it). React 19 compatible.

**Cost: roughly 35–50 KB gzipped, shipped to every route once anything imports
it.** That is a real number to weigh in BR-4 — if the kit is rejected, `motion`
should come out with it.

---

## 4. How each component was recoloured

The rule: **no hardcoded hex survives.** Colours become `var(--br-blue)` /
`var(--br-pink)` / `var(--br-black)`, and every alpha becomes
`color-mix(in srgb, var(--br-…) N%, transparent)`.

That last part matters more than it looks. BennyRich derives every halo in the
system from a single `--glow-scale` variable in `tokens.css`. A component with
baked-in `rgba()` values would sit outside that knob and silently drift out of
tune the moment anyone turns it. Going through `color-mix` over the tokens keeps
the vendored components on the same dimmer as everything else.

Alongside recolouring, every component got a **restraint pass of roughly −40%**:

| Component             | Upstream                                    | Here                                            |
| --------------------- | ------------------------------------------- | ----------------------------------------------- |
| `Spotlight`           | alphas .08 / .06 / .04; drift 100px over 7s | .05 / .035 / .025; 60px over 14s                |
| `CardSpotlight`       | `#262626` flat grey fill, radius 350        | `--br-blue` at 14%, radius 320                  |
| `TextGenerateEffect`  | `blur(10px)`, stagger 0.20s                 | `blur(4px)`, stagger 0.12s                      |
| `InfiniteMovingCards` | fast/normal/slow = 20/40/80s                | 48/80/120s, defaults to slow                    |
| `BackgroundBeams`     | cyan → violet → purple, strokeOpacity 0.4   | `--br-blue`, strokeOpacity 0.25, durations +40% |

`TextGenerateEffect` also had its typography stripped out entirely — upstream
bakes in `font-bold`, `text-2xl` and `dark:text-white text-black`, which fight
any design system it lands in. It now inherits from the caller, so it can carry
`br-tagline` (Inter, uppercase, `.3em`) without a fight.

---

## 5. What did not port cleanly

Three real problems, all found by reading the source rather than by running it.

### `CardSpotlight` — partial port, canvas layer dropped

Upstream renders a `CanvasRevealEffect` inside the hover mask: an animated
dot-matrix on a `three` / `@react-three/fiber` canvas. Dropped, for two
independent reasons — roughly 600 KB of WebGL for a hover decoration on a
storefront, and a continuously animating dot field directly contradicts the
design system's _"nothing pulses — the neon is steady and no glow is ever
animated"_.

What remains is the `useMotionValue` + `onMouseMove` radial mask, which is
precisely the effect BR-3 asked for. **The vendored file is therefore a partial
port and is labelled as such in its header**, so nobody "completes" it later
without re-reading the reasoning.

### `InfiniteMovingCards` — SSR-hostile by construction

Upstream duplicates the marquee track in a `useEffect` by `cloneNode`-ing every
child into the DOM after mount, and gates the animation behind a `start` state
flag. Under SSR the server renders a half-width, unanimated track and hydration
visibly jumps.

Fixed by doubling the array at render time and setting the CSS custom properties
inline, so first paint is already correct. The second copy is `aria-hidden` so
screen readers do not read the list twice.

Its card markup — a testimonial with quote, name, title, grey gradients and
`rounded-2xl` — was discarded wholesale. **Only the mechanism was vendored**:
duplicate the track, translate `-50%` on a linear loop, mask both edges, pause on
hover.

### `BackgroundBeams` — hydration mismatch

Calls `Math.random()` **inside the render body** to vary each of 50 beams' end
point, duration and delay. Server and client roll different numbers, so React
warns on every mount. Replaced with `jitter(index, salt)`, a deterministic hash
of the beam index: both passes agree, the beams still look uncorrelated.

It also gradients cyan → violet → purple, i.e. three accents on one element,
which "one accent per component" forbids. It is now single-accent blue, with an
opt-in `tipPink` prop left in so BR-4 can see the alternative.

### A fourth, smaller one

Every component's `prefers-reduced-motion` story needed rebuilding. This project
already has a global CSS block that crushes `animation-duration` and
`transition-duration` to `0.001ms`. That is a good backstop, but on its own it
makes an un-guarded animation **snap** — a 10px blur slamming to zero, a marquee
jumping to its end frame — which is arguably worse than the animation. Every
component now also calls `useReducedMotion()` and renders its finished state,
and `kit.css` pins the marquee to its start frame.

---

## 6. The design-system tension worth ruling on

Two of these components **move continuously**: the spotlight drift and the
marquee. `CLAUDE.md` currently says:

> Nothing pulses — the neon is steady and no glow is ever animated. The header
> is the one exception to "no movement".

The spotlight is defensible — it is ambient light, not an animated glow, and at
14s over 60px it is barely perceptible. **The marquee is not defensible under
the current wording.** It never stops.

Adopting either beyond `/kit` needs an explicit amendment to that rule, not a
quiet exception. That is a call for Akke and Sander, and it is the main thing
`/kit` exists to support.

---

## 7. The reuse pattern for future tenants

> **Vendor manually into `components/kit/`, recolour to tenant tokens.**

The full loop, in order:

1. **Pull from the registry JSON, not the web page.**
   `https://ui.aceternity.com/registry/<name>.json` → `.files[].content`. Read
   `.dependencies` and `.registryDependencies` _first_ — that is where the
   `three` surprise lives.
2. **Copy into `src/components/kit/`**, one file per component. Never
   `src/components/ui/` — that is shadcn's, and mixing them loses track of what
   is vendored.
3. **De-Next it.** Strip `"use client"`; `next/image` → `<img>`; `next/link` →
   the router's `Link`. Check the `cn` import matches the project alias.
4. **Recolour to tenant tokens through `color-mix`**, never hardcoded `rgba()`.
   If the tenant has a global intensity knob, the components must ride it.
5. **Restraint pass, ~40%.** These are built for louder brands than most
   maison-tier clients. Cut alphas, shorten travel, lengthen durations.
6. **Translate config-era animation to CSS.** v4 has no config: `@keyframes` +
   `@utility` in a _separate_ stylesheet, imported from the main one, so the
   whole kit is one `rm` and one deleted import if it is rejected.
7. **Audit for SSR hazards.** `Math.random()` / `Date.now()` in a render body,
   and post-mount DOM mutation. Both were present here.
8. **Handle reduced motion in JS**, not only in CSS. A global duration crush
   makes animations snap; components must render their finished state.
9. **Header-comment every file** with source URL, registry URL, and each
   adaptation — especially deliberate omissions. Future-you will otherwise
   "fix" the WebGL layer back in.
10. **Prove it on one throwaway route** (`/kit`), out of the nav, `noindex`,
    with static data so screenshots need no API. Decide on rollout separately.
11. **Check the licence at source, per library.** Do not trust the ecosystem's
    "it's MIT" — see §2.

### Worth knowing for next time

- **Magic UI is MIT-licensed** and overlaps heavily with Aceternity. On a
  tenant engagement where the client takes the repo, prefer it.
- Budget for the motion library in the bundle conversation up front.
- The registry's `registryDependencies` field is the single most useful
  early-warning signal. Read it before falling in love with a component.
