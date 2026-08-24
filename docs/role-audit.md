# Role audit — BR-2 (foundation + homepage)

Date: 2026-08-18 · Branch: `main`

## Scope

Turn the Zona Dorata remix into the BennyRich storefront: strip the old brand,
stand up the design system and brand assets, and ship the homepage plus the
first set of routes reading from SellQo through `sellqoProxy`.

## Stripped

- `src/assets/brand/logo-{black,gold,white}.svg`, `src/assets/worlds/**`,
  `src/assets/hero/**`, `src/assets/featured/**`
- Components: `Diamond`, `SplashScreen`, `TrustBar`, `CategoryHero`,
  `EditorialPage`, `ComingSoon`
- Routes: `/artworks`, `/craftsmanship`, `/designer-clothes`, `/jewellery`,
  `/our-story`, `/selfcare` (and `/perfumes` — see _Deviations_)
- All Zona Dorata colour tokens (`--gold`, `--bone`, `--gold-l`), fonts
  (Cormorant Garamond, Cinzel, Archivo), copy, titles and social images.
  `grep -ri "zona\|dorata\|cormorant\|cinzel" src/` → 0 hits.
- The site was already English-only; there was no NL i18n layer to remove.
- `seed/` untracked (`git rm -r --cached`) and gitignored.

## Kept and restyled

- `SiteLayout`, `Header`, `Footer`, `CartDrawer`, `ProductCard`,
  `CategoryProductsPage`, `product.$slug` — rewritten visually, data hooks and
  cart behaviour untouched.
- Legal pages (`/terms`, `/privacy-policy`, `/shipping-returns`) rebranded and
  moved from the deleted `EditorialPage` onto the new `PageShell` primitives.
  Product language was updated: the "Fragrances" return clause became
  "Beverages" (sealed bottles, 18+).
- Checkout routes rebranded and repainted onto the BennyRich palette.
- Frozen files (`sellqo.ts`, `sellqo.functions.ts`, `cart-context.tsx`,
  `checkout.ts`, `CheckoutForm.tsx`, `integrations/**`) were **not edited**.
  The legacy CSS variables `CheckoutForm` depends on (`--paper`, `--ink`,
  `--line`, `--muted-tone`, `--font-display`, `.ui-label`, `.zd-input`) are
  kept in `tokens.css` as documented compatibility aliases remapped onto the
  BennyRich palette, so the frozen file renders on-brand without being touched.

## Decisions

- **Bodoni Moda + Inter** (both OFL, Google Fonts) for display and UI, per the
  brief. Bodoni's high-contrast Didone shapes match the reference wordmark.
- **Hand-drawn SVG artwork.** `Monogram`/`Wordmark` are React components;
  `shh-kid.svg` and `rifle.svg` are plain SVG files inlined via `?raw` so a
  single file stays the source of truth while `currentColor` and the neon glow
  filter still apply. Iterated against `docs/brand/logo-blue.jpg` and
  `docs/brand/website-mock.jpg` until the B/R overlap, circle weight and
  tracking read correctly.
- **Local image fallback** rather than touching the backend — see CLAUDE.md.
  The mock used for local screenshots deliberately serves the _real_ (currently
  dead) bucket URLs so the fallback path is what actually gets exercised.
- **Neon utilities use Tailwind v4 `@utility`** instead of a raw
  `@layer utilities` block, because plain-CSS utilities are not variant-
  composable and `group-hover:neon-line-blue` would silently do nothing.
- **Search** was implemented for real (header icon → `/shop?q=`) rather than
  left as a decorative icon, since `sellqoProxy` already maps it.

## Deviations from the brief

1. **`./seed/images` and `./seed/brand` were not in the repo.** Only the four
   text files were committed. The 26 product images and 3 brand references were
   taken from the same bundle in `~/Downloads/seed` (contents match
   `seed/README.md`) and copied to `public/products/` and `docs/brand/`.
2. **No `index.html`.** This is TanStack Start; the title/meta/favicon changes
   the brief assigns to `index.html` were made in `src/routes/__root.tsx`.
3. **No `tailwind.config`.** Tailwind v4 is CSS-configured; the theme lives in
   `src/styles.css` (`@theme inline`) and `src/styles/tokens.css`.
4. **`/perfumes` still exists as a redirect shim.** `EmptyCartRedirect` inside
   the frozen `CheckoutForm.tsx` links to `/perfumes`; deleting the route broke
   the typecheck. Per the hard rules I did not edit the frozen file — instead
   `src/routes/perfumes.tsx` now redirects to `/shop`. **The empty-checkout
   screen still shows a "Shop Perfumes" button label**, which only a change to
   `CheckoutForm.tsx` can fix. Needs a decision in BR-3.
5. **Banner uses two accents.** Section 3 of the brief (and the mock) puts a
   blue line and a pink line inside a pink frame, which is a documented
   exception to "one accent per component".
6. **Screenshots were captured against a local mock** of the storefront API,
   because `SELLQO_API_KEY` is a Lovable Cloud secret and is not available
   locally. The product data is the committed seed spec; the images are the
   real committed files reached through the fallback path.
7. **`bun run lint` is red**, but it was already red before this batch on files
   this work never touched (`CheckoutForm.tsx`, `lib/utils.ts`,
   `components/ui/button.tsx` — all prettier formatting). Files authored or
   edited here were run through prettier. `bun run build` and `tsc --noEmit`
   are both green, which is what the brief gates on.

## Verification

- `bun run build` — green.
- `bunx tsc --noEmit` — clean.
- `grep -ri "zona\|dorata\|cormorant\|cinzel" src/` — 0 hits.
- Homepage renders 4 featured cards with images from a single
  `sellqoProxy` `/products` call.
- Screenshots: `docs/screens/BR-2/home-390.png`, `docs/screens/BR-2/home-1280.png`
  (captured over CDP with device emulation — Chrome's `--window-size` clamps to
  500px and silently crops mobile captures).
- Contrast on `--br-black`: `--br-mute` 5.96:1 ✅, `--br-white` 18.55:1 ✅,
  `--br-pink` 5.82:1 ✅.

## Open items

- **Real vector artwork from Sander.** `shh-kid.svg`, `rifle.svg` and the
  monogram are hand-authored stand-ins that read as the right character but are
  not the production illustrations.
- **`--br-blue` (#1E5BFF) is 3.88:1 on black** — below AA for small text. It is
  used for 12px nav/button labels. The brief pins the value, so it was kept;
  recommend a lighter blue (or a larger minimum size) for small blue text in BR-3.
- **`br-sunglasses` has no image.** Its cards fall through to the empty state;
  `/collections` skips imageless products when choosing a tile image.
- **Vodka is stock 0** pending the accijns (excise) decision, so it renders sold
  out everywhere.
- **DB image-URL reconcile is owned by Akke.** The bucket URLs in the SellQo
  rows currently 404; the local fallback covers it until they land.
- **Accounts.** The header account icon opens a "coming soon" note — there is no
  auth in this batch.
- **Full variant picker** for `/product/:slug` lands in BR-3; the current page
  shows the option chips but tells the shopper the full picker is coming.
- **`/collections` "Explore" links into `/shop?category=`** rather than a
  dedicated collection route; revisit if collections need their own pages.

---

# BR-2.1 — tone refinement

Date: 2026-08-19 · Branch: `main`

## Scope

Tone only. No new features, no change to the SellQo plumbing. The storefront
read as a neon playground; the job was to make it read as a house.

## Step 0 did not hold — the product images were not replaced

The brief states that the 26 files under `public/products/` had been overwritten
with black-background–normalised versions. They had not been. All 26 are
**byte-identical** to the original seed bundle (`cmp` against
`~/Downloads/seed/images` — 26 identical, 0 changed), their mtimes are unchanged
since BR-2, `git status` was clean, and nothing newer exists on disk.

Sampling the corner pixels of each image:

- **17** have black backgrounds (fine as-is)
- **2** are mid-tone room scenes — `rug-allover-pink`, `rug-monogram-frame-pink`
- **7** are still pure white — `bust-tee-blue`, `cushion-rifle-blue`,
  `cushion-skyline-pink`, `cushion-vault-blue`, `f8-tee-blue`, `f8-tee-pink`,
  `monogram-puffer-pink`

Step 5's normalisation was built and is in place, but it is calibrated for
black-background photography: `contain` + 8% padding + a 6%-opacity vignette
dissolves a residual dark edge, and cannot hide a pure white field. Those seven
cards will keep reading as white panels until the real files land. On the
homepage this is visible on **Monogram Puffer**, which additionally carries a
baked-in "Door AI gegenereerde inhoud" watermark. Repainting product photography
is not a tone refinement and is Akke's asset task, so nothing was altered.

## Glow

One knob, `--glow-scale` in `tokens.css`, drives every halo; all radii and
alphas are `calc()`ed from it. `1` is the tuned setting, `0` is flat colour.

| Surface       | Before                        | After                         |
| ------------- | ----------------------------- | ----------------------------- |
| `neon-text-*` | 3 layers, 2/8/24px, 40% bloom | 2 layers, 1px core + 6px/55%  |
| hero headings | same as body text             | 1px core + 10px/62%, no bloom |
| `neon-line-*` | 8px / 60%                     | 5px / 40%                     |
| wordmark      | outlined + full 3-layer glow  | solid `--br-blue`, 3px / 30%  |

New `logotype-blue|-pink` and `logotype-glow-blue|-pink` utilities carry the
near-solid treatment; `Monogram` gained an `intensity="logotype"` prop and the
header and footer lockups both use it. The wordmark's `-webkit-text-stroke`
outline is gone — at 18px in a header a 1px outline closes up and stops reading,
which is exactly why it looked like tubing rather than a logotype.

No glow is animated anywhere. The only `animate-*` classes left in the tree are
in unused shadcn primitives that the storefront never renders.

## Pink

Now confined to: the emphasis word ("LUXURIOUS.", "Made to stand out."), the
"View all" accent carried over from the mock, attention states (the 18+ gate,
form errors, the "Remove" hover) and the bag count badge. Removed from the
banner frame, from the Beverages collection tile (heading, hover border and
"Explore" are all blue now) and from the arrow on every product card.

## Banner artwork: rifle → panther

`rifle.svg` stays in the repo but is no longer imported — the `Rifle` component
was deleted so nothing bundles it. To bring it back on a product page, import
`rifle.svg?raw` the way `panther.svg` is imported in `LineArt.tsx`.

The banner now carries `panther.svg`: a reclining panther in profile, one
continuous closed silhouette in restrained blue, capped at 380px against a
~992px banner interior (38%), right-aligned with generous black around it. The
pink neon frame is replaced by a `--br-line` hairline with a faint blue inner
glow (`quiet-frame`).

**The panther is a hand-drawn stand-in and the head is its weakest read** — it
took six iterations to stop reading as a house cat, and the skull still sits
closer to "big cat" than to "panther". Body, haunch and tail are sound. It
belongs on the list for Sander's real vector artwork alongside the shh-kid.

## Air

- Section rhythm from one place: `br-section` / `-t` / `-b` = `clamp(80px, 12vh, 160px)`
- Hero `min-height: 86vh`; hero type `clamp(36px, 6vw, 76px)` (was `40/7vw/88`)
- Page headings `clamp(26px, 4.2vw, 46px)` (was `30/5vw/54`) — about −15%
- New `br-section-label`: 11px Inter, tracking `.28em`
- `br-nav` down to 11px, tracking `.22em → .24em`; wordmark tracking `.18em → .2em`
- Product grid: 32px gaps, 12px between row items
- Header stays 72px with a `--br-line` bottom, and only picks up a
  `blur(12px)` frosted ground once the page has scrolled past 8px
- Product card: name Inter 11px / `.2em` / `--br-white`; price Bodoni 15px
  `--br-mute`, no glow; frame lifts to faint blue on hover, never pink

## Verification

- `bun run build` green; `bunx tsc --noEmit` clean
- Screenshots: `docs/screens/BR-2.1/home-390.png`, `home-1280.png`
- Header and footer lockups read as a logotype, not signage
- Banner has no pink border; nothing pulses

## Open items (unchanged from BR-2, plus one)

- **Real vector artwork from Sander** — now covers the panther as well as the
  shh-kid and the monogram.
- **Product images still need the black-background pass** (see step 0 above) —
  7 white, 2 mid-tone.
- `--br-blue` (#1E5BFF) is 3.88:1 on black, below AA for the 11px nav and
  button labels. The brief pins the value; a lighter blue for small text is
  still the recommendation.
- `br-sunglasses` has no image.
- Vodka is stock 0 pending the accijns decision.
- **DB image-URL reconcile to the bucket is owned by Akke** — the URLs in the
  SellQo rows still 404 and the local fallback covers it.
- The frozen `CheckoutForm` still shows a "Shop Perfumes" button on the
  empty-cart screen; `/perfumes` remains a redirect shim to `/shop`.

---

# Role audit — BR-3 (design-kit recon)

Date: 2026-08-21 · Branch: `main`

## Scope

Evaluate whether Aceternity/Magic UI components can lift BennyRich to maison
quality **on our stack** — TanStack Start + Vite + Tailwind, not the Next.js
they assume. Vendor a small curated set, recolour to BR tokens, show them on one
throwaway route `/kit`.

No site rewrite. No SellQo plumbing touched — `sellqo.functions.ts`, `sellqo.ts`,
`cart-context.tsx`, `checkout.ts`, `CheckoutForm.tsx` and `integrations/**` were
read only, and `/kit` imports none of them. The homepage and `Header.tsx` are
unchanged.

The reusable write-up is **`docs/design-kit.md`** — that is the artifact meant
to travel to the next tenant. This section records the decisions.

## Stack findings

- **Tailwind is v4.2.1**, CSS-first, no `tailwind.config.js`. This is the good
  case: Aceternity targets v4, so **no utility classes needed rewriting**.
- The inverse bites once: anything Aceternity declares _in_ `tailwind.config.js`
  has nowhere to land. `InfiniteMovingCards` gets its `animate-scroll` class
  from a config `keyframes`/`animation` extend; the v4 equivalent is
  `@keyframes` + `@utility`, now in **`src/styles/kit.css`**.
- React 19.2, TanStack Start 1.167, Vite 8, bun. Alias `@/*` → `./src/*`.
- One new dependency: **`motion@13.1.0`** (`motion/react` is a straight
  `export *` from `framer-motion`). **~35–50 KB gzipped, shipped to every route
  once anything imports it.** If BR-4 rejects the kit, remove `motion` too.

## CLI vs manual: manual, and it was not close

`npx shadcn add @aceternity/...` is not viable here:

1. `components.json` has `"registries": {}` — no `@aceternity` namespace, so the
   command does not resolve as written.
2. The payload is Next.js-shaped: `"use client"`, `next/image`, `next/link`.
3. The CLI's Tailwind step expects a `tailwind.config.js` to extend.
4. `card-spotlight` carries a **registry dependency on `canvas-reveal-effect`**,
   which imports `three` and `@react-three/fiber`. The CLI would have installed
   both silently.

The useful discovery: the component pages render their code client-side, so
fetching the HTML yields nothing, but **the shadcn registry JSON serves the real
files** — `https://ui.aceternity.com/registry/<name>.json`. Its
`registryDependencies` field is what exposed the `three` dependency before any
install happened.

One thing would have been free either way: Aceternity imports `cn` from
`@/lib/utils`, which is already our alias.

## Components chosen, and why subtle beat flashy

Aceternity's catalogue is mostly built for loud landing pages — 3D tilt cards,
meteor showers, glare, animated gradient borders. Those were skipped on sight.
What was taken adds **light and pacing**, not spectacle, because that is what
"signage seen from across a quiet room" needs.

| Component             | Port                 | Role                                    |
| --------------------- | -------------------- | --------------------------------------- |
| `Spotlight`           | complete             | Ambient blue light behind the hero      |
| `CardSpotlight`       | **partial**          | Cursor-following glow on a product card |
| `TextGenerateEffect`  | complete             | Tagline reveal                          |
| `InfiniteMovingCards` | mechanism only       | Slow marquee                            |
| `BackgroundBeams`     | complete, **unused** | Parked for a BR-4 trial                 |

Every one got a **restraint pass of ~40%** (alphas cut, travel shortened,
durations lengthened) and recolouring through `color-mix()` over the `--br-*`
tokens rather than hardcoded `rgba()`, so they ride the single `--glow-scale`
knob like the rest of the system.

## What did not port cleanly

1. **`CardSpotlight` is a partial port.** Its `CanvasRevealEffect` layer —
   an animated WebGL dot-matrix — was dropped: ~600KB of `three` +
   `@react-three/fiber` for a hover decoration, and a continuously animating dot
   field contradicts "nothing pulses". The mouse-following radial, which is what
   the brief actually asked for, is kept. The file header says so, so nobody
   "completes" it later without reading the reasoning.
2. **`InfiniteMovingCards` was SSR-hostile.** Upstream duplicates the track by
   `cloneNode`-ing children into the DOM in a `useEffect` and gates the
   animation behind a state flag, so SSR renders a half-width static track and
   hydration jumps. Replaced with a doubled array at render time.
3. **`BackgroundBeams` called `Math.random()` in the render body** for all 50
   beams — a guaranteed SSR/client hydration mismatch. Replaced with an
   index-seeded deterministic hash.
4. **Reduced motion needed rebuilding in all four.** The global CSS block in
   `tokens.css` crushes durations to `0.001ms`, which makes an unguarded
   animation _snap_ rather than not play. Each component now calls
   `useReducedMotion()` and renders its finished state.

## Licence — this is not what the brief assumed

The brief said "Aceternity free components = MIT-style, confirm". **Confirmed
false.** Checked at source on 2026-08-21:

- `ui.aceternity.com/licence` presents one proprietary "Aceternity License"
  covering "each item available for purchase or download", drawing **no**
  free/Pro distinction. It forbids redistributing an item's "source files,
  regardless of modifications".
- The registry JSON has an `author` field and **no licence field**.
- The public repo `manuarora700/ui.aceternity` has **no LICENSE file**.
- The widespread "MIT" claim traces only to third-party blogs and directories,
  none citing an Aceternity source.

Using the components in a delivered storefront is their intended use and is not
prohibited. Redistributing the source is — and `src/components/kit/` is source,
in a repo that syncs to Lovable.

**Decision needed from Akke before this pattern is reused on a paying tenant**
where the client takes repo ownership. BennyRich itself is fine (private repo,
components used not resold). If a firm answer is needed, ask Aceternity, or
prefer **Magic UI, which is genuinely MIT**, for client work.

## Deviations from the brief

1. **`/hero/shh-kid-ticket.png` does not exist.** `public/` holds only
   `favicon.svg`, `apple-touch-icon.png` and `products/`. The hero uses the
   existing `<ShhKid>` line art — what the live homepage uses — so `/kit`
   compares like-for-like with production. Agreed with Akke before building.
2. **Static product data, not `useProducts`.** Agreed with Akke. `SELLQO_API_KEY`
   is a Cloud secret, so a live hook would put a mock-server dependency on every
   screenshot for no extra signal, and `/kit` is proving components, not the
   data path. Names and prices are real (`seed/spec.json`).
3. **`BackgroundBeams` is vendored but not rendered on `/kit`**, only imported
   in a comment. The spotlight already answers "ambient light behind the hero";
   two light treatments on one page would muddy the judgement.

## The design-system tension to rule on

Two components **move continuously**: the spotlight drift and the marquee.
`CLAUDE.md` currently says _"Nothing pulses… The header is the one exception to
'no movement'."_

The spotlight is defensible — ambient light, not an animated glow, 60px over
14s. **The marquee is not defensible under the current wording**: it never
stops. Adopting it beyond `/kit` needs an explicit amendment, not a quiet
exception. This is the main thing `/kit` exists to settle.

## New finding: exactly which seed images are still white

BR-2.1 recorded "seven of the 26 seed images are still white" without naming
them. Measured directly this batch (mean luma of the four corners, 6% inset):

- **White ground (239–255):** `monogram-puffer-pink`, `f8-tee-blue`,
  `bust-tee-blue`, `cushion-vault-blue`.
- **Black ground (0–16):** `panther-tee-blue`, `countach-hoodie-blue`,
  `shh-tee-blue`, `cherub-tee-blue`, `vodka-blue`, `led-lamp-rolls-blue`,
  `golden-ticket-print`, `br-cap-blue`.

The `/kit` grid deliberately avoids the white ones — a white tile on a black
canvas distracts from judging the component. The full 26 have not all been
measured; the method is a four-corner luma sample and takes seconds to repeat.

## Verification

- `bun run build` — green.
- `bunx tsc --noEmit` — clean.
- `/kit` returns 200 and **server-renders** the full page: four cards, the
  marquee track, prices as `€79,99` (nl-BE via `formatEUR`).
- Screenshots: `docs/screens/BR-3-kit/kit-390.png`, `kit-1280.png`.
  Captured over CDP at real device viewports (390×844, 1280×900, DSF 2) by
  tiling and stitching. Two other capture paths were rejected and are documented
  in the capture script's header: `captureBeyondViewport` ghosts the footer
  icons at the page origin, and resizing the viewport to the page height
  inflates the layout, because `br-section` padding is `clamp(80px, 12vh,
160px)` — a 3217px viewport grows the page to 3529px.
- Nothing in the frozen set was modified: `git diff --stat` touches only
  `src/components/kit/**`, `src/routes/kit.tsx`, `src/routeTree.gen.ts`,
  `src/styles/kit.css`, `src/styles.css`, `package.json`, `bun.lock` and `docs/`.

## Open decision

**Roll the kit out to the homepage in BR-4 — pending Akke + Sander sign-off on
`/kit`.** Three things to rule on:

1. Does the movement earn its place at all?
2. Is the marquee worth amending "nothing moves except the header" for?
3. Is `motion` worth ~35–50 KB gzipped on every route?

If the answer is no, removal is one commit: delete `src/components/kit/`,
`src/routes/kit.tsx`, `src/styles/kit.css`, the `@import` in `styles.css`, and
`bun remove motion`.

## Open items carried forward from BR-2.1

Unchanged: real vector artwork from Sander; the DB image-URL reconcile owned by
Akke; `--br-blue` at 3.88:1 on black being below AA for 11px text;
`br-sunglasses` has no image; vodka stock 0 pending the accijns decision; the
frozen `CheckoutForm` still shows a "Shop Perfumes" button on the empty-cart
screen.

---

# BR-4 — homepage rollout (2026-08-21)

The `/kit` evaluation was answered: **spotlight, card glow and tagline reveal
in; marquee out.** BR-4 acts on that, with one change of plan.

## Own components replacing vendored ones

The client requires zero paid dependencies **and** zero licence grey area.
BR-3's own research (`docs/design-kit.md` §2) found the vendored components are
not MIT-licensed and their licence forbids redistributing source "regardless of
modifications" — and this repo syncs to Lovable and may be handed to the client.
Using them was fine; shipping their source was not.

So the three approved effects were **rewritten from a written spec** as
`Spotlight`, `SpotlightCard` and `TextReveal`. `grep -ri aceternity src/`
returns **0 hits**; the vendor's name is kept out of `src/` deliberately so that
grep stays useful as a standing check.

**`motion` is gone.** All three turned out to be expressible in plain CSS, which
answers BR-3's open question #3 by removal rather than by argument:
`framer-motion+[…].mjs`, 370 KB raw / 96.6 KB gzipped, is no longer in the
bundle, and the components ship no runtime dependency at all. Total client JS is
now 836 KB raw / 227 KB gzipped.

## Real brand artwork

`public/hero/` holds four transparent PNGs from Sander. Two are wired up:
`shh-kid-figure.png` (787×872) as the hero, `panther-blue.png` (875×673) on the
banner under a radial mask. `shh-kid-full.png` and `shh-kid-ticket.png` are
committed but unused.

The hand-drawn `ShhKid` and `Panther` line art is **parked, not deleted** —
`src/assets/brand/LineArt.tsx` and both SVGs stay in the repo alongside
`rifle.svg`, as documented stand-ins.

## `/kit` retired

`src/routes/kit.tsx`, all five vendored components and `src/styles/kit.css` are
deleted; `routeTree.gen.ts` regenerated with 0 `kit` references.
`docs/screens/BR-3-kit/` is kept as the historical record.

## Verification

- `bun run build` — green. `bunx tsc --noEmit` — clean.
- The homepage **server-renders** correctly: hero `<img>` with intrinsic
  787×872 and `fetchPriority="high"`, `.br-spotlight-a` / `-b`, three
  `.br-reveal-part` spans, the panther with its mask. Prices render `€79,99`
  (nl-BE via `formatEUR`).
- **Reduced motion checked with computed styles**, not by eye. Under emulated
  `prefers-reduced-motion: reduce`: `animation-name` is `none` on both the
  spotlight and the reveal, and the reveal renders `opacity: 1; filter: none;
transform: none` — the final state, not a snapped one. With motion on, the
  spotlight drifts (`br-spotlight-drift-a`, 14s) and the reveal has settled to
  the same final state. The card glow sits at opacity 0 with a 200ms transition.
- Screenshots: `docs/screens/BR-4/home-390.png`, `home-1280.png`, captured over
  CDP at 390×844 and 1280×900, DSF 2, by tiling and stitching.
- Nothing in the frozen set was touched. `ProductCard.tsx` was not modified
  either — `SpotlightCard` is borderless by default so it contributes only the
  glow layer.

## New findings this batch

**React 19 preloads high-priority images by itself.** An explicit
`<link rel="preload" as="image">` in the route's `head()` produced a _duplicate_
preload at a **lower** priority than the one React already hoists from
`<img fetchPriority="high">`. The hand-written one was removed; verified in the
SSR output that exactly one preload remains, carrying `fetchPriority="high"`.

**A fourth screenshot capture path that does not work.** BR-3 recorded three.
Add: _priming the scroll range_ — scrolling to the bottom and back to warm the
compositor — leaves a **stale footer tile ghosted over the hero**. It was
introduced while trying to fix the ghosting and turned out to cause it. Tile 0
must be taken on a page that has never been scrolled. Also, a `position: sticky`
header must be hidden with `visibility` on every tile after the first, or it is
stitched into the page once per tile.

**`bun run lint` is red, and was already.** 278 problems (266 errors), almost
all `prettier/prettier` formatting on pages untouched by this batch — an
identical count on BR-3's commit `10207c7`, so this batch introduces none. The
four BR-4 files pass `eslint` cleanly on their own. Fixing the rest is a
formatting-only sweep worth its own commit; it was left out rather than
ballooning this diff.

## Design-system note: the glow dimmer no longer reaches the artwork

Every halo in the system derives from `--glow-scale`. The two hero PNGs bake
their own glow into the raster, so **they no longer track that dimmer** — turning
`--glow-scale` now moves the type and the frames but not the artwork. This is
the accepted cost of real art over line art, recorded here so nobody spends an
afternoon wondering why the hero will not dim.

## Open items carried forward

Unchanged from BR-2.1 / BR-3:

- **Akke:** the DB image-URL reconcile to the Supabase bucket. When those URLs go
  live, `<ProductImage>` uses them first and the local fallback never fires.
- **Akke:** vodka stock is 0 pending the accijns decision.
- `br-sunglasses` has no image.
- `--br-blue` is 3.88:1 on black — below AA for 11px text. Still used for
  `br-section-label` eyebrows.
- Seven of the 26 seed images still have white grounds; `.br-media` is calibrated
  for black-background photography and cannot hide them. The four measured white
  ones are `monogram-puffer-pink`, `f8-tee-blue`, `bust-tee-blue`,
  `cushion-vault-blue`.
- The frozen `CheckoutForm` still shows a "Shop Perfumes" button on the
  empty-cart screen.

---

# BR-5 — shop + polish (2026-08-21)

Live tenant data had drifted: 24 active products, **none flagged `is_featured`**,
four new LED lamps with no variants, apparel with Colour/Size variants. The
homepage was showing three lamps in a row, product photos with light grounds
were dissolving into the page, long names truncated, and the banner panther had
almost vanished under its mask.

## The neon frame, and why not per-image normalisation

Product photography comes from the tenant's own admin. Seven of the 26 seed
images have white or near-white grounds, and whatever Sander uploads next is
outside our control. Normalising images one at a time fixes a snapshot and
starts rotting immediately.

Framing the **well** instead fixes all of them at once and keeps working: a
`br-media-frame` utility — 55% blue border plus a 6px/35% halo, both riding
`--glow-scale` — means the card reads against the page whatever the photo does.
Hover keeps `neon-line-blue`, so brightening still has somewhere to go
(55→100% border, 35→40% halo).

**No double border.** Both states set `border-color` from a class, never an
inline style, and Tailwind compiles the hover to
`.group:hover .group-hover\:neon-line-blue` — specificity (0,2,0), which beats
`.br-media-frame` (0,1,0) whatever the source order. Applied through
`ProductCard`, so home, shop, collections and related products all pick it up,
plus the product-detail gallery.

## Smart featured selection

`SellqoProduct` **has no category field**, so a single `/products` call cannot
say what anything belongs to — which is exactly why "featured" had degraded to
"whatever sorted first". The homepage now issues **one query per category**
(the pattern `/collections` already used), making membership true by
construction, and `src/lib/featured.ts` picks a spread: flagged pieces first if
they ever exist, then round-robin one per category, then a top-up so the grid is
never short. Products with no artwork are skipped in the first two passes —
`br-sunglasses` has none, and an empty well is worse than a different product.

Verified against four scenarios, including a catalogue where only one category
has stock. Live-like data now yields apparel / accessories / home / lighting.

## The variant bug this batch actually fixed

The picker rendered from `product.options` and gated the add button behind
`needsVariant`. **If SellQo returns variants but no `options` array, no chips
render, no variant can be selected, and the product cannot be bought at all.**
The tenant's apparel appears to use exactly that shape.

`src/lib/variants.ts` now derives the options from the variants themselves,
probing both `option_values` and `attribute_values`, preserving first-seen order
so the picker reads Colour-then-Size. A product whose variants carry no usable
option data is treated as **buyable** rather than locked out — absent data
should degrade to a default add, not a dead page.

Also: out-of-stock combinations render struck through and disabled, judged
against the _other_ selected options (picking Blue greys the sizes out of stock
in blue, not Blue itself); single-value options are auto-selected; and the
"Full variant picker arrives in the next drop" placeholder is gone.

## Age gate and the vodka

The 18+ interstitial was already wired and is unchanged. The vodka is held back
by `NOT_PURCHASABLE` in `categories.ts`: it stays visible and browsable, the add
button reads "Coming soon" with a short note, and the card carries the badge.
Keyed by slug and independent of any admin flag, so it holds whatever the tenant
data says. **Enabling purchase later is deleting one line.**

## Verification

- `bun run build` green, `bunx tsc --noEmit` clean, no frozen file touched.
- Mock modelled on the described live data: 24 products, none featured, lamps
  with 0 variants, apparel with `attribute_values` and **no** `options` key, and
  deliberately out-of-stock combinations. If the derivation ever regresses, the
  mock catches it.
- Variant gating driven through a real browser: chips derive from
  `attribute_values`; picking Blue disables S (out of stock in blue) while
  M/L/XL stay live; Blue+M enables "Add to bag"; the lamp shows a plain add with
  no picker; the vodka shows "Coming soon", disabled.
- **Totals proved to come from the API, not from us.** The mock was temporarily
  patched to overstate the subtotal by €100. With one €89,99 lamp in the bag the
  drawer rendered **€189,99** — the API's inflated number, not a recomputed one.
  That is the house rule demonstrated rather than asserted.
- Checkout walked end to end against the mock: details → payment → confirmation
  with an order reference, no console exceptions.
- Screenshots: `docs/screens/BR-5/`, 7 at 1280 and 3 at 390.

## New findings this batch

**The checkout was rendering Italian currency format.** `checkout.tsx`,
`checkout.payment.tsx` and `checkout.confirmation.$orderId.tsx` all imported
`formatEUR` from the frozen `sellqo.ts`, which formats it-IT — `89,99 €` —
directly against the house rule. None of those three routes is frozen, so all
three now import from `lib/format.ts` and render `€89,99`. The frozen duplicate
is untouched.

**"Grazie" was still on the order confirmation** — a Zona Dorata leftover, and
the rules say English only. Now "Thank you".

**Shipping cost is not reflected in the summary until the order is submitted.**
`checkout.payment.tsx` defers `checkoutSetShipping` to the submit handler, so
choosing Express leaves the summary reading "Free" until completion. It is
existing checkout logic and this batch was explicitly told not to reimplement
any, so it is **flagged, not fixed** — worth a decision next batch.

**A fifth screenshot capture trap**, on top of BR-4's four: `position: fixed`
overlays (the cart drawer, the age gate) repaint in _every_ tile exactly like a
sticky header, so stitching stamps the drawer down the page three times. They
are viewport-sized by design and must be captured as a single frame.

## Open items

- **Vodka accijns — blocks purchase.** `NOT_PURCHASABLE` holds it; delete the
  slug to release it.
- **Akke:** the DB image-URL reconcile to the Supabase bucket.
- `br-sunglasses` still has no image; the featured spread routes around it.
- `--br-blue` is 3.88:1 on black — below AA for 11px text.
- `bun run lint` remains red at a pre-existing 278 problems, almost all
  `prettier/prettier` formatting on files this batch never touched. Unchanged
  count since BR-3; worth its own formatting-only sweep.

---

# BR-6 — checkout polish (2026-08-24)

Three issues from the live-preview walk. One of them turned out not to be the
issue it looked like.

## Variant labels: the render was never missing

**The checkout summary already rendered `it.variant_label`** — the same field,
from the same `useCart()` context, as the cart drawer, and it had since the
initial remix commit. The legacy tokens around it are properly aliased
(`--ink → --br-white`, `--muted-tone → --br-mute`), so nothing was invisible
either. There is exactly one summary that lists line items; the payment and
confirmation steps show totals only.

Two surfaces reading one field cannot disagree about data, so the symptom had to
be **the field being empty**.

**Root cause, in the frozen `sellqo.ts`.** `normalizeCart` derives the label
from `variant_label ?? variant.name ?? variant.option_values`. This tenant sends
none of those — its variants carry **`attribute_values`**, which is exactly why
BR-5's `deriveOptions` had to probe both keys on the product page. The label
comes back `null`, and because `normalizeCart` maps to a fixed shape the raw
variant is discarded: by the time a component sees the cart there is nothing
left to recover from.

**Reproduced before fixing.** The mock previously synthesised `variant_label` on
every cart line, which would have hidden the defect entirely. It now models the
live payload — no `variant_label`, a nested `variant` carrying
`attribute_values`. Against it:

```
before   DRAWER  "Panther Tee €79,99 1 Remove"
         SUMMARY "1 Panther Tee €79,99"
after    DRAWER  "Panther Tee Pink · L €79,99 1 Remove"
         SUMMARY "1 Panther Tee Pink · L €79,99"
```

So the bug was **wider than reported**: the drawer lost the label too. The
belief that the drawer was fine most likely came from the `cart_add_item`
response carrying variant data while a later `cart_get` did not.

**The fix, `src/lib/cart-labels.ts`.** For a line with a variant but no label,
look the product up and match the variant by id, building the label with BR-5's
`optionValuesOf` so `attribute_values` is understood. Joined with `" · "`, the
separator `normalizeCart` itself uses, so a resolved label is indistinguishable
from an API-supplied one. A line that already has a label is passed straight
through — **this goes inert the moment SellQo starts sending one.** The query
key is byte-identical to `product.$slug.tsx`, so the drawer and the summary
share one cache entry and a shopper arriving from a product page pays nothing.

> **Upstream fix, for whoever can change the frozen file:** teach
> `normalizeCart` to probe `attribute_values` alongside `option_values`. Then
> `cart-labels.ts` becomes dead weight and can be deleted.

## One image treatment everywhere

The three surfaces disagreed: the grid used `.br-media` (object-contain, 8%
padding, 1:1) while **both** thumbnails used `object-cover`, which cropped.
Chosen: **contain everywhere, square well.** Nothing is cropped, so the rug
room-scene and the full-bleed tees keep their content, and every product sits
identically framed regardless of its source ratio.

Wide images still band top and bottom. That is inherent to not cropping and was
accepted deliberately over the alternative.

Before/after: `docs/screens/BR-6/thumbnails-before-after.png`. Note that both
halves show a variant label — BR-5's mock supplied one, so that capture is a
valid before for the **image treatment only**, not for the label.

The checkout thumbnail also picked up the hairline the drawer's already had, and
`ProductImage`'s local fallback walk that its raw `<img>` never had.

**Fixed in passing:** the checkout quantity badge sat at `-top-1/-right-1`
_inside_ an `overflow: hidden` well and was being clipped. It is now a sibling of
the well, and its colours moved off the legacy `--ink`/`--paper` aliases.

## Zona Dorata leftovers

`EmptyCartRedirect` sent an emptied bag to `/perfumes` with a "Shop Perfumes"
button. Both now point at `/shop`, labelled "Shop the collection"; verified in a
browser that emptying the bag lands on `/shop`. `src/routes/perfumes.tsx` — a
redirect shim that existed only because `CheckoutForm` was frozen — is deleted,
and `grep -rn perfume src/` returns nothing.

**`PrimaryButton` was a solid white slab.** It rendered `background: var(--ink)`,
which aliases to `--br-white`, against "buttons are ghost only, transparent
ground with a 1px neon border" — on the button that closes the sale. Now
`neon-btn`; confirmed by computed style: transparent background, `--br-blue`
text and border.

Full sweep for `perfume` / `Grazie` / `Zona` / `Dorata` / `it-IT` / `Mancini`.
Remaining hits are all legitimate: the frozen it-IT `formatEUR` (unused by the UI
since BR-5), an accurate protocol-lineage comment in `sellqo.functions.ts`, and
correct history in `CLAUDE.md` and this file. `.zd-input` keeps its Zona-shaped
class name — ten call sites of churn for no visible gain — but its stale comment
claiming the frozen `CheckoutForm` uses it is corrected.

**`CheckoutForm.tsx` is no longer frozen.** Recon confirmed it is presentation
only — `FormField`, `FieldError`, `PrimaryButton`, `EmptyCartRedirect`, and a
read-only `useCart`. No SellQo logic. `CLAUDE.md`'s list is updated to match.

## Verification

- `bun run build` green, `bunx tsc --noEmit` clean, **no frozen file touched**.
- Label before/after proved against the live-shaped mock, both surfaces.
- The no-variant lamp renders with no variant line, cleanly, on both surfaces.
- **Totals still come from the API.** BR-5's lie test re-run against the checkout
  summary: the mock was patched to overstate the subtotal by €100, and with one
  €89,99 lamp the summary rendered **€189,99** — the API's number, not a
  recomputed one.
- Screenshots in `docs/screens/BR-6/`.

## A sixth screenshot-capture trap

BR-4 recorded four and BR-5 a fifth. Add: the checkout's **`lg:sticky` order
summary** repaints in every tile and gets stitched in once per tile, exactly like
the sticky header and the fixed overlays before it. The capture script now hides
elements by **computed position** (`sticky` or `fixed`) after tile 0 rather than
by tag name, which covers the next one without a seventh discovery.

## Open items

- **Vodka accijns — still blocks purchase.** `NOT_PURCHASABLE` holds it; delete
  the slug to release.
- **Akke:** DB image-URL reconcile to the Supabase bucket.
- `br-sunglasses` still has no image.
- `--br-blue` is 3.88:1 on black — below AA for 11px text.
- **Carried from BR-5, still deferred:** choosing a shipping method does not
  update the summary until the order is submitted, because
  `checkout.payment.tsx` defers `checkoutSetShipping` to the submit handler.
  Untouched again this batch — it is checkout logic, and reimplementing any
  remains out of scope. Worth an explicit decision.
- `bun run lint` remains red at a pre-existing ~278 prettier-formatting problems
  on files these batches never touched.

---

# BR-7 — image fit: contain → cover (2026-08-24)

BR-6 put every product image on `object-fit: contain` so nothing was cropped.
The side effect: source aspect ratios still differ, so each product floated at a
different size inside an identical frame and a row read as **products floating
in black** rather than as a grid.

**Decision: centre-cover.** A uniform row beats preserving full bleed. Every
image now fills its square well edge to edge, so framing is identical regardless
of source ratio, and the edges crop. Before/after:
`docs/screens/BR-7/grid-before-after.png`.

## The one exception

The **large product-detail image keeps `contain`**, via a new
`.br-media-contain` modifier. It is the single place a shopper is deciding
whether to buy, and it must show the whole garment — measured, a centre crop
costs the countach hoodie 32% of its width, and that image is a front+back shot,
so cover cuts one garment off entirely. The gallery's thumbnail strip is a row
and follows the row rule.

Rule order in `tokens.css` is load-bearing: the gallery element carries both
classes and the selectors have equal specificity, so `.br-media-contain > img`
must stay _after_ `.br-media > img`. Commented in place.

## What cover costs, measured

All 26 committed seed images analysed by **content bounding box** — background
sampled from the corners, then the fraction of content falling outside a centre
square. Ratio alone is misleading: `br-cap` is 1.50 wide but loses nothing,
because the cap sits centred in black.

**10 of 26 lose ≥19% of their content — these are Sander's to reshoot or
recrop:**

| Product                       | Ratio | Lost  | Why it matters                                    |
| ----------------------------- | ----- | ----- | ------------------------------------------------- |
| `led-lamp-rifle`              | 1.87  | 39% H | Not wired up anywhere (ad-safety) — cosmetic only |
| `countach-hoodie` blue + pink | 1.50  | 32% H | **Front+back shot; one garment is cut off**       |
| `vodka` blue + pink           | 0.71  | 26% V | Tall bottle; cap and/or base clipped              |
| `led-lamp-rolls-pink`         | 1.50  | 26% H | Wide lamp shot                                    |
| `runner-champagne-pink`       | 0.80  | 20% V | Tall runner                                       |
| `led-lamp-rolls-blue`         | 1.82  | 20% H | Wide lamp shot                                    |
| `f8-tee` blue + pink          | 1.25  | 19% H | Two-model shot; one model clipped                 |

Borderline (7–18%): `shh-tee`, `bust-tee`, `cherub-tee`,
`rug-monogram-frame`, `distressed-tee` ×2.
Untouched: both `panther-tee`, both `br-cap`, all three cushions,
`golden-ticket-print`, `monogram-puffer`, `rug-allover`.

**No per-product `object-position` hacks** — centre-cover is the rule. The fix
is better source images, not CSS exceptions.

## The second-order effect: white grounds got louder

Cover makes the white-background problem **more prominent, not less.** Six seed
images have near-white grounds (`f8-tee` ×2, `bust-tee`, all three cushions at
254–255, `monogram-puffer` at 240). Under contain they were inset by 8% padding
with black around them. Under cover they are **solid white squares filling the
neon frame**, edge to edge, on a black page — clearly visible in
`docs/screens/BR-7/shop-grid-1280.png`.

So the row is now uniform in _shape_ but not in _ground_: black tiles beside
white ones. Same reshoot list, and it is the most likely thing to look worse
than expected.

## Verification

- `bun run build` green, `bunx tsc --noEmit` clean, **no frozen file touched**.
- **Asserted by computed style, not by eye:** the shop grid reports
  `object-fit: cover` with `object-position: 50% 50%` and `0px` padding across
  23 images; the product gallery reports `contain` with 8% padding; the gallery
  thumbnails report `cover`.
- Screenshots in `docs/screens/BR-7/` — homepage and `/shop` at 1280 + 390, the
  product gallery, cart drawer and checkout summary thumbnails, and the grid
  before/after.

## Open items

Unchanged, and now joined by the reshoot list above:

- **Vodka accijns — still blocks purchase.** `NOT_PURCHASABLE` holds it.
- **Akke:** DB image-URL reconcile to the Supabase bucket.
- `br-sunglasses` still has no image (renders the "No image" placeholder).
- `--br-blue` is 3.88:1 on black — below AA for 11px text.
- **Carried from BR-5, deferred twice:** choosing a shipping method does not
  update the summary until the order is submitted, because
  `checkout.payment.tsx` defers `checkoutSetShipping` to the submit handler.
  Untouched again — it wants an explicit decision rather than another deferral.
- `bun run lint` remains red at a pre-existing ~278 prettier-formatting problems
  on files these batches never touched.

---

# Banner artwork: panther → rifle (2026-08-24)

**Change, at Sander's request:** the "BUILT DIFFERENT / MADE TO STAND OUT"
banner on the homepage now carries `public/hero/rifle-blue.png` instead of
`panther-blue.png`. Only the `src`, the `alt` and the column width changed —
the radial mask (74%/100%), the `brightness(1.1)` lift, the blue drop-shadow
riding `--glow-scale`, the `--br-line` hairline frame and the right alignment
are all exactly as BR-4/BR-7 left them.

The grid column went from `minmax(0,46%)` to `minmax(0,54%)`. The rifle is a
3.58 aspect ratio against the panther's 1.13, so at the old width it rendered
455×127 and read as a thin strip. It is now 535×149 — 46% of the panel, still
right-aligned, with the heading still on one line at 1280. Mobile is unchanged
(`max-w-[300px]`, centred).

Intrinsic `width`/`height` are corrected to 1577×441 in the same edit. They had
been left at the _original_ panther's 875×673 through the cleaned-panther swap,
so the reserved layout box had the wrong aspect ratio and the banner shifted as
the image loaded. That is fixed as a side effect of this change.

## ⚠️ FLAG — firearm imagery on the landing page

**This is documented and accepted by the client. It is not a blocker, and it was
their call.** Recording it so nobody is surprised later:

- **Meta (Facebook/Instagram)** prohibits ads that promote the sale of firearms,
  parts and ammunition, and applies the policy to _imagery_ as well as to what
  is actually being sold. A landing page whose main banner is a rifle can get a
  creative rejected even when the advertised product is a t-shirt, and repeated
  rejections put the ad account itself at risk.
- **TikTok** similarly prohibits weapons content in ads and reviews the landing
  page, not just the creative.
- The exposure is **the whole homepage**, because this is the URL paid traffic
  lands on. Anything pointing at `/` inherits the risk.

BR-2.1 removed a rifle from this exact banner for this exact reason —
`CLAUDE.md` recorded it as "read as a club flyer, not ad-safe" — so this
reverses a previous deliberate decision. The artwork itself is different (clean
neon line art rather than the old stand-in), but the ad-policy exposure is the
same.

**If paid social becomes a channel**, the cheapest mitigation is a dedicated
ad-safe landing page rather than changing the brand: point campaigns at
`/shop?category=apparel` or a purpose-built route, and leave `/` as it is. No
work has been done toward that; noting it as the option if it is ever needed.

The rifle-themed _products_ (`cushion-rifle-blue`, `led-lamp-rifle`) are
unaffected by this note — they are catalogue items, and the same policy would
apply to advertising them regardless of the banner.

---

# BR-8 — launch essentials + technical cleanup (2026-08-24)

Launch-web plumbing plus four technical debts cleared. Everything frontend; no
SellQo plumbing touched.

## Favicons

Full set — `favicon.ico` (16/32/48), `favicon-16`, `favicon-32`,
`android-chrome-192`, `android-chrome-512`, `site.webmanifest` — all rasterised
from the existing `favicon.svg`, so every icon is provably the same BR monogram
rather than a redraw. `apple-touch-icon.png` was left alone: rendering the SVG
at 180 and diffing gives a mean absolute difference of **1.0/255**, so it is
already the same artwork and regenerating would be churn. Rasterising used
`cairosvg` in the throwaway venv — **no project dependency added**.

## Metadata, OG and canonicals

`src/lib/site.ts` holds `SITE_URL` and the helpers everything derives from.

> **`SITE_URL` is the one line to change when the real domain lands.** It
> currently points at `https://akke-aigento-bennyrich.lovable.app`, inferred
> from the Cloudflare worker name because nothing in the repo recorded the
> deployed origin. If that guess is wrong, canonicals and share previews point
> at the wrong host until that string is corrected — nothing else needs editing.

Root: `twitter:card` → `summary_large_image`, absolute `og:image` /
`twitter:image` at `/hero/og-image.jpg`, `og:url`, and the 1200×630 dimensions.

**`/product/:slug` needed a route loader, and that is the substantive change in
this batch.** `head()` cannot see data fetched by `useQuery` inside the
component, and social scrapers do not run JavaScript — so metadata set on the
client would never reach Facebook, X or a crawler. The route now loads the
product via the existing `sellqoFetch`, `head()` builds the title, description
and `og:image` from it, and the component's `useQuery` is seeded with
`initialData` from the loader, so it is **one fetch, not two**.

Verified with `curl` against the SSR HTML rather than in a browser, because that
is what a scraper sees. `docs/screens/BR-8/product-head.txt` is the captured
head; `/product/panther-tee` returns its own title, an absolute `og:image`
pointing at that product's photo, and a single canonical. A product with no
artwork (`br-sunglasses`) correctly falls back to the house image.

**Bug found while verifying:** a canonical in the root head emitted a _second_
canonical on every page, because root and route `links` are concatenated rather
than merged — and two canonicals mean a crawler honours neither. Canonicals now
live only on routes; the noindex checkout routes deliberately have none.

## robots.txt and sitemap.xml

`robots.txt` allows all, disallows `/checkout` and `/account`, points at the
sitemap. `sitemap.xml` is rendered on request from `src/server.ts`: this build
of TanStack Start exports **no server-route factory**
(`createServerFileRoute` / `createAPIFileRoute` do not exist in 1.167.50), and
our SSR entry already sees every request.

> **Products are not in the sitemap yet — the flagged risk landed.**
> `sellqoProxy` is a TanStack server function and needs the Start
> AsyncLocalStorage context; the fetch entry runs _before_ Start does, so the
> call throws `No Start context found in AsyncLocalStorage`. The approved
> fallback engaged: the lookup is wrapped, one warning is logged, and the
> sitemap still returns 200 with valid XML listing the eight static routes.
>
> To add the ~24 product URLs, `productEntries()` in `src/lib/sitemap.ts` is the
> only function that changes — it would have to talk to the storefront API
> directly rather than through the proxy, which means duplicating the action
> protocol. That trade was deliberately not taken.

## JSON-LD

Organization in the root, with `sameAs` derived from the footer's own `SOCIALS`
list rather than retyped, so the schema cannot drift from the links on the page.
Product on `/product/:slug`, built from the loader data already fetched — no
extra API call.

**Caught while verifying:** availability reported `InStock` for the vodka, which
is held behind `NOT_PURCHASABLE` pending excise clearance. That would have told
Google the bottle is buyable while the page's own button says "Coming soon".
Availability now requires in-stock **and** purchasable.

## Consent gate — nothing is tracked

`src/lib/consent.tsx` provides `useConsent()` / `hasConsent(category)`, false
for everything except `necessary` until accepted. The choice is a **first-party
cookie** (`br_consent`, SameSite=Lax, ~6 months), not localStorage: a consent
decision should be presentable and readable server-side. The consent cookie is
strictly necessary and exempt from requiring prior consent.

**No third-party analytics or advertising script is loaded anywhere in this
batch.** Verified from the network log, not by reading code: a full session
produced no third-party request other than the Google Fonts stylesheet that was
already there.

### Adding analytics later

Gate it — never load it unconditionally:

```ts
const { hasConsent } = useConsent();
useEffect(() => {
  if (!hasConsent("analytics")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.dataset.cfBeacon = JSON.stringify({ token: "<token>" });
  document.head.appendChild(s);
  return () => s.remove();
}, [hasConsent]);
```

A Meta pixel goes behind the same check with category `marketing`. **Do not put
the script in `__root`'s `scripts`** — that loads it before the shopper has
answered, which is the whole thing the gate exists to prevent.

## Technical cleanup

**Shipping updates the summary immediately.** `checkoutSetShipping` is now
called on _selection_ rather than deferred to submit — the total used to read
"Free" right up to the moment the order was placed. Only _when_ the existing
function runs changed; no checkout logic was reimplemented. Races are guarded
with a monotonic ticket so a slow earlier response cannot overwrite a newer
choice. Verified: choosing Express moves the summary from
**Shipping Free / Total €89,99** to **Shipping €12,50 / Total €102,49** before
submit. **This closes the item deferred through BR-5, BR-6 and BR-7.**

**AA contrast.** `--br-blue` (#1E5BFF) is **3.88:1** on black — fails AA for
normal text. New `--br-blue-text` (**#4A7DFF, 5.50:1**, measured) covers the
11px uses: nav states, section eyebrows, small links and the `neon-btn` _label_.
`neon-btn`'s border and every glow, large accent and the wordmark keep #1E5BFF.
Confirmed from the live DOM: the section eyebrow computes `rgb(74,125,255)` at
11px, ratio 5.50.

**Three error surfaces, not two.** The 404 and the router error boundary moved
off shadcn defaults onto black, Bodoni, the wordmark and ghost buttons — and so
did `src/lib/error-page.ts`, the SSR catastrophic fallback, which was a white
`#fafafa` system-font page and is the only screen shown when SSR itself fails.
It cannot import from the app, so its brand values are inlined literals with a
note to keep them in sync.

**Prettier sweep**, run _first_ rather than last so it could not swallow the
batch's new code. Lint went 278 → 144 problems.

> **`bun run lint` cannot reach green.** Every remaining auto-fixable error is
> inside a frozen file — `sellqo.ts`, `sellqo.functions.ts`, `cart-context.tsx`,
> `integrations/**` — which the sweep touched and which were reverted, because
> a cosmetic change to a frozen file is still a change. Outside the frozen set,
> **39 problems remain and none are formatting**: 26 `no-explicit-any` and 13
> `react-refresh/only-export-components`, nearly all in unused shadcn `ui/`
> primitives.

## New finding worth a decision

**Google Fonts loads before consent.** The stylesheet and two woff2 files are
fetched from `fonts.googleapis.com` / `fonts.gstatic.com` on first paint, which
transmits the visitor's IP to Google before they have answered the banner. A
German court has ruled against exactly this. Self-hosting the two families would
remove the only third-party request the site makes. Not done here — it is a
separate change with its own testing — but it is the obvious next privacy item.

## Verification

`bun run build` green, `bunx tsc --noEmit` clean, **no frozen file touched**
across the whole batch (`checkout.ts` changed by formatting only — called, never
rewritten). Screenshots in `docs/screens/BR-8/`.

## Open items

- **Stripe Connect — Sander.**
- **Vodka accijns — Sander.** `NOT_PURCHASABLE` holds it; delete the slug to release.
- **DB image reconcile to the Supabase bucket — Akke.**
- `br-sunglasses` still has no image.
- **BR-7 reshoot list:** 10 of 26 seed images lose ≥19% of their content to the
  centre crop; six white-ground images now fill their frame with white.
- Products missing from the sitemap (above).
- Google Fonts before consent (above).
- **Accounts phase next.**

---

# BR-9a — accounts foundation (2026-08-24)

Phase 2 is customer accounts. Core already runs a live, multi-tenant
`storefront-customer-api` edge function, so this is a frontend integration, not
a backend build. **Split in two**: BR-9a lands the foundation and everything
needed to get _into_ an account; **BR-9b** brings orders, addresses, wishlist
and checkout prefill.

## Proxy extended to the customer-api (additive)

`sellqo.functions.ts` now reaches a second edge function via a branch taken
before any existing code runs. Verified rather than asserted: `resolveAction`
and the storefront-api tail of the handler are **semantically identical to
HEAD** (compared with comments and whitespace normalised away). The only changes
to pre-existing lines are prettier reflowing long ones — impossible while the
file was frozen.

The customer endpoint is **derived from the URL the existing guard already
validated**, swapping `storefront-api` for `storefront-customer-api`, so there
is no second secret and the guard keeps working. The full action map landed in
one go, including BR-9b's routes, so the file is opened once.

## The token never reaches the browser

**Decision, and a correction to the brief's reasoning.** The brief proposed a
client-set cookie over localStorage "for the XSS surface". That does not hold: a
cookie written by client JS is exactly as readable by injected script as
localStorage is. The only version that actually resists XSS is an **httpOnly**
cookie, which has to be set server-side.

So login/register responses are intercepted **in the proxy**: the token goes
into an httpOnly, SameSite=Lax, 7-day cookie and is **stripped from the payload
returned to the client**. Two things fall out of that:

- Nothing needs forwarding from the client, so the frozen `sellqo.ts` — whose
  `FetchOpts` cannot carry headers anyway — stays untouched.
- The browser cannot tell whether a session exists without asking, so
  `AuthProvider` starts in `loading` and calls `/account/me` once on mount.
  Consumers must treat `loading` as a real state; reading "no customer yet" as
  "signed out" flashes a login form at every signed-in visitor.

Proved in a browser, not assumed: after registering, `document.cookie` and
`localStorage` contain **no token**, and the response header is
`br_customer_token=…; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`.

## Pages

`/account/login` (with `?next=` return-to), `/account/register` (min 8
characters, stated up front), `/account/forgot`, `/account/reset`, and a guarded
`/account` dashboard. The `/account` layout is **deliberately unguarded** —
login and register live under it, and guarding there would make signing in
impossible.

`RequireAuth` says in its own header that it is **UX, not security**: it only
decides what to render. The protection is the bearer token checked inside the
edge function.

**Bug found while verifying:** the guard read `next` from live router state, so
the redirect changed the pathname, the effect re-ran while still `guest`, and
`next` ended up pointing at the login page itself — signing in would have
bounced the shopper back to the form they had just completed. The intended path
is now captured once, on first render.

Header replaces "Accounts coming soon". The mobile menu gained the same entries:
the account icon is `hidden sm:block`, so without it there was no way into an
account from a phone.

## Verification

`bun run build` and `bunx tsc --noEmit` green. No frozen file touched —
`sellqo.ts`, `cart-context.tsx`, `checkout.ts` and `integrations/**` are
untouched; only `sellqo.functions.ts`, and only additively.

**Regression checked first**, because the proxy change is the risky part: `/`,
`/shop`, `/collections` and `/product/:slug` all still return 200 and the
product page still renders its own per-product title.

Then: register signs in and lands on `/account`; the session survives a reload;
`/account` while signed out redirects to `/account/login?next=%2Faccount`; sign
out clears the cookie and returns the header to its signed-out state.

Everything is proved against the **mock**, which now models the customer-api
(note that `storefront-customer-api` does not contain the substring
`storefront-api`, so it needs its own branch in the mock exactly as in the
proxy). **A live end-to-end pass against the real tenant is Akke's follow-up** —
the API key is a Cloud secret and cannot be reached from here.

## ⚠️ Two core blockers

**1. Order history is exposed without email verification.** The customer-api
matches orders by `customer_email` and verification is not enforced
(`email_verified` stays false). Anyone can register with someone else's email
and see that person's past guest orders — names, shipping addresses, items,
totals. No password, no inbox access.

Agreed response: **BR-9b will gate `/account/orders` behind `email_verified`**,
so the exposure is closed from our side, and core must either enforce
verification at register or require `email_verified` for `get_orders`. Accepted
trade-off, stated plainly: **orders stay invisible to everyone until core sends
a verification email.** Better than shipping the leak.

**2. The reset email does not link here.** Core's reset email points at
`sellqo.lovable.app/shop/{slug}/reset-password`, not our `/account/reset`, so
**nobody currently arrives on our reset page from an email**. The page works for
anyone who arrives with the right query parameters. Making that URL
tenant-aware is a core change.

## Open items

- **Core:** reset-email URL is not tenant-aware (above).
- **Core:** email verification not enforced; orders exposed by email (above).
- Loyalty/points deferred to a later phase; the tables exist.
- **BR-9b:** orders + detail, addresses CRUD, wishlist + heart toggle, checkout
  prefill.
- **Sander:** Stripe Connect; vodka accijns.
- **Akke:** DB image reconcile to the bucket; live end-to-end auth pass.
- `br-sunglasses` image; BR-7 reshoot list; sitemap products; Google Fonts
  loading before consent.

---

# BR-9b — account area (2026-08-24)

Completes the account area with the parts that can ship **safely**: addresses
CRUD, wishlist, and checkout prefill.

## ⛔ Order history was cut, and why

**`get_profile` does not return `email_verified`.** The gate BR-9a designed and
BR-9b briefed therefore **cannot be built** — there is nothing to gate on.

That is decisive rather than inconvenient. `get_orders` matches by
`customer_email` and core enforces no verification, so an unguarded order page
would expose **other people's guest orders** — names, shipping addresses, items,
totals — to anyone who registers with their email address.

`/account/orders` and `/account/orders/:id` are **not built**. Order history
returns only once core does **both**:

1. returns `email_verified` from `get_profile`, **and**
2. enforces email verification at register, or requires `email_verified` for
   `get_orders`.

Nothing dangles: the dashboard's Orders tile stays visible but **non-linking**,
with an honest "Not available yet" rather than a link to a page that cannot load
safely. Confirmed by grep that no route, header menu or mobile menu references
either path.

> **Profile editing is also absent.** It was in the original BR-9 brief but fell
> between the two halves of the 9a/9b split and was in neither's steps. Its tile
> is non-linking too. Recorded so it is not mistaken for an oversight.

## `sellqo.functions.ts` was not touched

The brief refers to "the customerProxy from 9a". **No such export exists** — 9a
added an _additive branch inside_ `sellqoProxy`. The outcome matches the intent
anyway: 9a deliberately landed the **full** customer action map in one go, so
9b needed no change to that file at all.

## Addresses

List, add, edit, delete. Every mutation **reconciles against the array the API
returns** rather than patching local state, so the list cannot drift from the
server's view.

**Defaulting is probed, not assumed.** Core's addresses are jsonb and may carry
no default flag; `hasDefaultFlag()` checks whether any address mentions one and
the chip and control render only if so. The mock deliberately **omits** the
flag, so the absent case is the one under test — a default that was invented
here would be a lie the backend cannot honour.

The 15-country list moved from `checkout.index.tsx` into `src/lib/countries.ts`
so checkout and the address form share one source instead of drifting.

## Wishlist

`useWishlist()` holds the saved-id set from **one cached query per customer** —
a grid of 24 cards reads a single `wishlist_get`, not 24. **Guests never fetch
at all**; there is nothing to fetch and asking would guarantee a 401.

`ProductCard`'s root is now a relative `<div>` holding the `<Link>` **plus the
heart as a sibling**. A `<button>` inside an `<a>` is invalid HTML and a known
keyboard and screen-reader trap; `preventDefault` would only paper over a
structure that should not exist. This is the batch's highest-regression change —
the card renders on the homepage grid (inside `SpotlightCard`), `/shop`,
`/collections` and related products, and all four were re-verified.

## Checkout prefill

Fills **only fields still empty** and **only values that exist**, so partial
data cannot blank anything and typing is never overwritten. `checkout.ts`,
`CheckoutForm.tsx`, every total and every logic path are untouched.

**Two refs, not one.** The profile is ready as soon as auth resolves, but the
addresses arrive on their own schedule; a single "done" flag would fire on the
first pass and leave the shipping fields permanently empty. Caught while
writing it, not in review.

## Verification

`bun run build` and `bunx tsc --noEmit` green; no frozen file touched.

Asserted in a browser against the extended mock:

- a **guest** clicking the heart lands on `/account/login?next=%2Fshop`, and
  **zero `wishlist_get` requests** are made for a guest
- an authed heart saves **without navigating**, and flips to its pressed state
- the saved piece appears on `/account/wishlist`; removing it there clears the
  heart back on the shop grid (0 pressed, 24 unpressed)
- address add round-trips and renders with its country name
- signed-in checkout arrives prefilled with profile **and** address; a guest's
  checkout renders **completely empty**, so prefill is a genuine no-op
- regression: `/`, `/shop`, `/collections`, `/product/:slug` all still 200 after
  the ProductCard restructure

The "typing is never overwritten" guarantee is enforced by construction — the
fill helper skips any field that already has a value — rather than by a timed
test.

Address and wishlist envelopes are **modelled in the mock**, not verified
against live: the API key is a Cloud secret. Reads are deliberately tolerant of
a bare array or a wrapper object. **A live pass is Akke's follow-up.**

## Open items

- **Core, blocking order history:** `get_profile` does not return
  `email_verified`; register neither sends a verification email nor enforces
  verification. **Both** must land before order history can ship.
- **Core:** the reset email points at `sellqo.lovable.app/shop/{slug}`, not
  `/account/reset`.
- Profile editing not built (above). Loyalty/points deferred; tables exist.
- **Sander:** Stripe Connect; vodka accijns.
- **Akke:** DB image reconcile to the bucket; live end-to-end account pass.
- `br-sunglasses` image; BR-7 reshoot list; sitemap products; Google Fonts
  loading before consent.

---

# BR-10 — accounts complete: verification + order history (2026-08-24)

Closes the chain BR-9a and BR-9b could not close: **register → verification mail
→ confirm → order history**. Everything BR-9b listed as blocking has landed in
core (CUSTAUTH-1), so this batch is the storefront half.

Commits: `570f2f2` (proxy), `971d917` (`/account/verify`), `dad3108` (orders),
`824faa3` (banner), `63dea03` (profile), plus this paper trail.

## What core now guarantees

`storefront-customer-api` sends a verification email on `register`, exposes
`verify_email` and `resend_verification`, returns `email_verified` from `login`
and `get_profile`, and answers `get_orders` / `get_order` with **HTTP 403 +
`EMAIL_NOT_VERIFIED`** while the address is unconfirmed. Verification and reset
mails build their link from a `url_base` the storefront supplies, checked
against core's allowlist.

## ⛔ The blocker this batch had to fix first

`sellqo.functions.ts` cleared the session cookie on **any 401 or 403**:

```ts
if (customerRes.status === 401 || customerRes.status === 403) {
  await clearCustomerToken();
  throw new Error("NOT_AUTHENTICATED");
}
```

Core's new 403 is not "you are not signed in" — it is "you are signed in and not
yet verified". Shipping order history without touching this would have **signed
customers out the moment they clicked Orders**. An `EMAIL_NOT_VERIFIED` check
now sits **before** that branch and throws a distinct error instead. This is the
regression the batch would have introduced, so it is asserted explicitly (check
D below), not reasoned about.

## `sellqo.functions.ts` — three additive changes, 34 insertions, 0 deletions

The most sensitive file in the project; it is extend-additively-only, not
frozen.

1. `verify_email` and `resend_verification` added to `PUBLIC_CUSTOMER_ACTIONS`
   and mapped from `/auth/verify` and `/account/resend-verification`. Verify
   must be public: the click arrives from an inbox, with no session cookie.
2. `url_base` injected **server-side** from `SITE_URL` for `register` and
   `request_password_reset` only. The function runs with `verify_jwt = false`,
   so a client-supplied `url_base` would be a phishing vector — a branded mail
   from the real sender pointing anywhere. Client code cannot set or override
   it here.
3. The `EMAIL_NOT_VERIFIED` exception above.

`resolveAction` (7498 chars) and the storefront-api tail (1561 chars) were
diffed **byte-for-byte** before and after — identical. The product, cart and
checkout routing is untouched.

## Order history

`/account/orders` and `/account/orders/$orderId`, both behind `<RequireAuth>`
and gated twice: on `email_verified` up front, and on core's 403 as the
backstop. Both gates render the same `VerifyGate` — one screen, whichever gate
fires — with a resend button.

**No total is ever computed here.** Subtotal, shipping, VAT and total are read
from the API and formatted; a figure this page added up could disagree with the
invoice. Amounts go through `formatEUR` from `src/lib/format.ts` (nl-BE), not
the `it-IT` one still living in the frozen `sellqo.ts`. Dates are en-GB
("12 August 2026"), statuses mapped to English labels.

The query does **not retry** on the gate: `retry: (count, error) =>
!isNotVerifiedError(error) && count < 2`. Retrying a 403 that will stay a 403
just delays the message.

## Verification banner

Renders only when `customer?.email_verified === false` — an explicit `false`,
never a falsy check. An older core omits the field, and `undefined` read as
"unverified" would nag people about an email that was never sent.

It is a nudge, not a wall: sign-in, profile, addresses and wishlist all keep
working unverified. Only order history is gated, because only order history
exposes data that predates the account. Shape and motion follow `CookieBanner` —
`quiet-frame`, hard edge, opacity-only entrance, nothing pulses.

## `/account/profile`

Never existed; it fell between the halves of the 9a/9b split. Two cards:
details (`PATCH /account/me`, with the marketing opt-in) and password
(`POST /account/password`). `refresh()` runs after a successful save or the
header keeps greeting you by your old name. The confirm field is validated in
the browser and **never sent** — core wants two passwords, not three.

## Security choices

- `url_base` is server-side only (above).
- `/account/verify` fires its POST **once**, guarded by a `useRef`. React 19's
  double-invoked effects would otherwise burn the single-use token on the first
  render and show the customer an "invalid link" for a link that was valid.
- Every new route carries `noindex, nofollow`, like the rest of `/account/*`.
- The session token stays in the httpOnly cookie; nothing added here reads it.

## Verification

`bun run build` and `bunx tsc --noEmit` green. No frozen file touched:
`sellqo.ts`, `cart-context.tsx`, `checkout.ts`, `integrations/**` unchanged;
`sellqo.functions.ts` additive and diffed as above.

The mock was extended with `verify_email` (above the auth gate),
`resend_verification`, a token map, and orders that return **403
`EMAIL_NOT_VERIFIED`** while unverified — so both branches are genuinely
exercised. Six branches were first checked over curl: 403 unverified → bad token
400 → good token 200 → replay 400 (single-use) → 2 orders after verify → detail
with items, totals and address.

Then in a real browser, end to end, all green:

```
PASS A dashboard shows the verification banner — /account
PASS A signed in after register
PASS B Orders + Profile tiles link — orders=true profile=true
PASS B no 'Not available yet' left
PASS C orders gated for unverified — /account/orders
PASS D STILL SIGNED IN after the 403 — landed on /account/orders
PASS D session survives a follow-up navigation
PASS E expired/invalid link explained
PASS F verify success
PASS G orders listed after verifying — 2 order links
PASS G EUR nl-BE formatting — ORDER BR-1001 €189,98 12 August 2026 · Shipped
PASS H detail shows items and totals — /account/orders/ord-1001
PASS H detail shows the delivery address
PASS I banner gone after verifying
PASS J profile renders both cards — /account/profile
```

Screenshots in `docs/screens/BR-10/` (1280, plus 390 for the gate, verify
success and the orders list).

Two notes on the harness, both my own bugs rather than the code's: the first run
failed everywhere because a cold Vite dev server was still compiling when the
register form was submitted (fixed with warm-up navigations), and checks H and J
failed because the assertion truncated the page text at 320 chars and matched
case-sensitively against headings the CSS uppercases. Verified with a full-body
probe before changing anything.

## Deviations from the brief

1. **"Use the existing `customerProxy` from 9a"** — no such export. BR-9a added
   an additive branch *inside* `sellqoProxy`; `docs/role-audit.md` already said
   so. Extended that branch instead.
2. **"Re-enable order history (removed in 9b)"** — it was never built. `git log
   --all --diff-filter=D` finds no deleted `account.orders*` file. Built from
   scratch; only the proxy mapping pre-existed, with no caller.
3. **`/account/profile` likewise did not exist** — a new page, not a gap.
4. **The 403 blocker** was not in the brief and had to be fixed before step 3
   could work at all.

## Not touched

Frozen plumbing, the product/cart/checkout proxy paths, `CheckoutForm`, every
9a/9b screen. `routeTree.gen.ts` is regenerated by the build, never hand-edited.

## Open items

- **Akke, before the mails are real:** `SITE_URL` is still the Lovable preview.
  Core allowlists `*.lovable.app`, so it works today. The real domain must land
  in `tenant_domains` (`dns_verified` + `is_active`) or `tenants.custom_domain`
  **and** in `src/lib/site.ts`, or core refuses the `url_base` and the links
  fall back to the old path.
- **Akke:** live end-to-end pass against real core with a real inbox — the mock
  sends nothing. DB image reconcile to the bucket.
- **Sander:** Stripe Connect; vodka accijns.
- Loyalty/points deferred; the tables exist.
- `br-sunglasses` image; BR-7 reshoot list; sitemap products; Google Fonts
  loading before consent.
- The mock and the CDP check script still live in a scratchpad, not in git.
  Worth moving into the repo before the next account batch.
