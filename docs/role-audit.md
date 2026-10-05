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
   an additive branch _inside_ `sellqoProxy`; `docs/role-audit.md` already said
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

# BR-11 — client revision round (2026-08-26)

Date: 2026-08-26 · Branch: `main` · Commits: `8095f49`…`a8aa1c5`

Sander reviewed v1 on the preview and sent ten changes plus the **official
logo**. Most of this batch is his call being carried out; two items are ours to
explain, and they are first.

---

## ⛔ Root cause: the mobile menu was not "transparent", it was 72px tall

What he saw on a phone: open the hamburger after scrolling and the menu links
float over the page with no background behind them.

`backdrop-filter` with **any value other than `none`** makes an element a
**containing block for its fixed descendants**. The header takes
`blur(12px)` once the page scrolls past 8px (`Header.tsx`, the `scrolled`
state), and the "full-screen" menu was a `fixed inset-0` **child of that
header**. So `inset-0` resolved against the 72px header box, not the viewport.

Measured over CDP at 390×844, scrolled to y=400, before the fix:

```
scrollY 400   header backdrop-filter "blur(12px)"
menu   getBoundingClientRect -> 390 x 72     <-- the header's box
header getBoundingClientRect -> 390 x 73
```

and after:

```
menu   getBoundingClientRect -> 390 x 844    <-- the viewport
header backdrop-filter while menuOpen -> "none"
```

The black ground covered only the bar; everything below it was the menu's own
text painted over the page, because nothing clips overflow there.

Repro kept: `docs/screens/BR-11/mobile-menu-scrolled-390-BEFORE.png` (the bug)
next to `mobile-menu-scrolled-390.png` (fixed).

**Fix:** the menu is rendered through `createPortal(…, document.body)`. Belt and
braces, the header also drops its `backdrop-filter` while `menuOpen`, so in that
state it is not a containing block at all.

**Standing rule, now in CLAUDE.md:** never nest a fixed overlay inside the
header. The desktop search bar and the Shop dropdown are `absolute` and
deliberately **not** portalled — they _want_ the header as their containing
block. Regression-checked at 1280 scrolled to 600: dropdown `top=65` under the
nav, search input `top=89` inside the expanded header.

---

## The logo: a client decision that overrules BR-2.1

BR-2.1 deliberately demoted the wordmark to a flat logotype, on the recorded
grounds that _"a logo has to read as print at 18px"_: no outline, no bloom,
`logotype-*` instead of `neon-text-*`. Sander's official mark is a fully-glowing
neon lockup. **He overrules that judgement.** It is a decision, not a
regression, and it costs three things worth naming:

1. **The glow no longer tracks `--glow-scale`.** It is baked into the raster,
   exactly like `shh-kid-figure.png` and `rifle-blue.png`. Turning
   `--glow-scale` now moves everything except the hero art, the banner art and
   the logo.
2. **"NEW YORK" is deleted.** The official lockup says **WORLDWIDE**; a city
   line contradicts it. `showCity` survives as a no-op so call sites compile.
3. **There is no pink set.** `tone="pink"` therefore still renders the _drawn_
   SVG monogram, which is the 18+ gate and nothing else. `neon_alpha.py` is
   committed next to `docs/brand/logo-pink.jpg` — one run produces it.

`Wordmark` and `Monogram` are now thin `<img>` wrappers that keep the old prop
API, so every call site swapped without a change of its own. `size` still means
what it meant (cap height of BENNY RICH; ring diameter for the monogram) and is
scaled off the delivered crops — cap 90/317 of the lockup, ring 101/136 of the
monogram. Omit `size` and a height class in `className` governs instead, which
is the only way to get a responsive height like the footer's `h-32 md:h-40`.

One consequence: `Monogram`'s **blue** branch now has zero call sites, because
the header's two uses became wordmarks and `Wordmark` no longer composes it. It
is kept because the brief asked for the prop API to survive.

---

## Splash screen

New `src/components/site/SplashScreen.tsx`, mounted once in `SiteLayout` at
`z-[100]` — above header `z-40`, cart drawer `z-50`, cookie banner `z-[55]` and
the 18+ gate `z-[60]`.

(Zona Dorata had a `SplashScreen`; BR-2 stripped it. This shares the name and
nothing else — it is our own component, no runtime dependency.)

- Artwork is **`shh-kid-full.png`**, derived to
  `public/hero/shh-kid-splash.png`: downscaled to 704×900 and pngquant'd from
  **1.2 MB to 201 KB**, because a first-paint overlay must not carry 1.2 MB.
  The original is untouched.
- Sized as a poster, not a badge — `h-[48vh]`, `md:h-[58vh] max-h-[680px]`,
  `max-w-[86vw]` — so the wordmark and tagline inside the artwork stay readable.
- Session key **`br_splash_shown`**, read in an effect inside `try/catch`. In
  private mode it is treated as already shown rather than reappearing on every
  navigation.
- Phases `pending → in → hold → out → done`. The fade in starts on the image's
  own `load`, **floored at 500ms and capped at 1500ms**, both measured from
  mount: the floor keeps it a beat rather than a flicker, the cap means a slow
  connection never stares at empty black and a failed image cannot stall it.
  Holds 2000ms, fades out over 1000ms, unmounts on `transitionend`.

Measured frame by frame at 1280 — 404 rAF samples from document start:

```
first rendered      857 ms   (after hydration)
full opacity       2270 ms   (= mount + 500 floor + 1000 fade)
unmounted          4355 ms   (= hold 2000 + fade 1000)
max opacity          1.00
```

- **`pending` renders nothing and is where every mount starts.** `SiteLayout`
  remounts on every client navigation, so reading the session key only in an
  effect without that gate would flash the overlay black for a frame on every
  route change. Asserted with a rAF sampler plus a `MutationObserver` across a
  click through to `/collections`: `flashedOnNavigation=false`.
- X and Escape both skip; the body scroll lock is released either way.
- Under `prefers-reduced-motion: reduce` it never renders a single frame
  (`everRendered=false`) and does not even claim the session key. Matched **by
  name** through `matchMedia`, not left to the global duration crush in
  `tokens.css`.

**Two design-system consequences, both accepted:** the 1000ms fade is the second
sanctioned motion exception after the header's frosted ground, and while the
splash is up it — not the hero figure — is the LCP element. Client decision,
matching Mancini Milano.

---

## Vodka section

`VodkaSpotlight`, between the featured grid and the "Built different" banner.
Blue is the one accent: a beverage is not a sale, so nothing here is pink.

**The claims are Sander's and nothing more.** "Belgian by origin" is what he
said. There is deliberately no distillery, no "craft" and no "triple-distilled",
because nobody has told us any of that is true.

The bottle sits in a `.br-media-contain` well — the second on the site after the
large product-detail image, and for the same reason: a bottle cropped at the
shoulders is not a bottle.

State is driven by `isPurchasable()`, so the excise decision flips this section
for free. Proved by temporarily emptying `NOT_PURCHASABLE` and reverting:

```
NOT_PURCHASABLE holds it   comingSoon=true   price=absent  cta="Discover the bottle"
slug removed (temporary)   comingSoon=false  price=shown   cta="Shop the bottle"
```

**No price while it cannot be bought** — the excise decision may move it and a
number here would be a promise we cannot keep.

Proved again with the mock stopped entirely: `rendered=true`, full copy, CTA
intact. Every word is static; the only thing the API contributes is the price.
The image resolves to `/products/vodka-blue.jpg` — the API's `featured_image` is
a bucket URL that 404s and `ProductImage` walks past it.

---

## OG image

`public/hero/og-image.jpg` still paired the shh-kid with the **old text**
wordmark, so every link shared from the site previewed a logo the brand no
longer uses. Rebuilt at 1200×630 with the same composition and
`logo-lockup-blue.png` in place of the type — 73 KB, and it now says WORLDWIDE
like everything else.

Rendered from a scratch HTML over `file://` with both images inlined as data
URIs: **no dev server, no mock, no SellQo call**, so a fixture change in
`tools/mock` can never break the share image. Captured at **DPR 1**, because an
OG image is 1200×630 actual pixels and a 2× capture would be the wrong size.

Same path, so `src/lib/site.ts` and every route are untouched. Verified in the
SSR head of `/`: exactly one `og:image`, absolute, plus matching
`twitter:image` and `og:image:width/height` 1200/630.

---

## Favicons — source resolution, and what it costs

The seven files are drop-in replacements under the same filenames, so
`__root.tsx` needed no change and got none. Every link in the head resolves
(all 200), declared sizes match the files, and the `.ico` still carries all
three directory entries (16/32/48) exactly as the old one did.

Two honest downgrades, both following from the source being a **WhatsApp JPEG**:

- `favicon.svg` is no longer a real vector. It is a ~60 KB SVG **wrapper around
  a 192px raster**, where the old one was an 814-byte drawn path. Sharper at the
  sizes that matter, heavier, and it will not scale past 192.
- `android-chrome-512.png` is a **5× upscale of a ~100px source** and is soft.

Both are fixed by one thing: the original vector. See open questions.

---

## Screenshot capture — a seventh trap

BR-4 recorded four, BR-5 a fifth, BR-6 a sixth. Add:

**Never pass `captureBeyondViewport: true` together with a `clip`.** It makes
Chrome re-lay-out the page at the full content size, which changes the layout
width — so a clip of the emulated viewport width then shows only the **left
slice** of a page that is now wider, and every full-page capture comes back
cropped down the right-hand edge. Both `home-1280` and `home-390` were captured
wrong before this was spotted. `tools/screens/capture.ts` now scrolls and
captures the plain viewport per tile, pins the last tile to the bottom of the
page and crops the overlap when stitching.

## The mock and the capture script are in git now

BR-10's own open items said both "still live in a scratchpad, not in git", and
they had indeed been lost. Rebuilt and committed as `tools/mock/` and
`tools/screens/` — dev-only, outside `src/`, no runtime dependency.

The fixtures reproduce the two live traps **on purpose**, or they would prove
nothing: `featured_image` points at a bucket URL that 404s, so `ProductImage`
actually walks on to `/products/<slug>-<colour>.jpg`; and variants carry
`attribute_values` only, so `normalizeCart` still cannot label a cart line and
`cart-labels.ts` is still doing real work.

## Verification

`bun run build` and `bunx tsc --noEmit` green before every push.

```
grep -rn 'hello@|instagram.com/bennyrich"|Five worlds|New York' src/   -> 0 hits
grep -ri aceternity src/                                              -> 0 hits
git diff e0ed189 -- <the five frozen paths> src/integrations/          -> empty
```

`src/lib/sellqo.functions.ts` was not touched at all this batch — there is no
proxy work in BR-11.

Behaviour asserted headlessly rather than eyeballed:

```
DESKTOP  hasToggle=true openedOnClick=true closedOnEscape=true
         reopened=true closedOnOutside=true
         rows=[All products, Apparel, Accessories, Home, Lighting, Beverages]
MOBILE   collapsedByDefault=true expanded=true collapsesAgain=true
         rows=[All products, Apparel, Accessories, Home, Lighting, Beverages]
SPLASH   flashedOnNavigation=false  closedByX=true  closedByEscape=true
         reduced-motion everRendered=false
VODKA    api-down rendered=true; NOT_PURCHASABLE toggle flips both branches
CONTACT  mailto -> info@bennyrich.com; IG -> instagram.com/bennyrichstore
         Organization sameAs -> profile URLs only, never the mailto
```

Screenshots in `docs/screens/BR-11/` (nine, plus the before-repro).

## Deviations from the brief

1. **`mancini-milano/src/components/SplashScreen.tsx` is not on this machine** —
   only `bennyrich` and `sellqo` are under `~/Projects`. The splash was built to
   the timings and behaviour the brief specifies rather than ported line by
   line.
2. **The desktop "click/tap toggle" is on the chevron, not the label.** Making
   the "Shop" link itself toggle would have removed the direct route to `/shop`
   from the nav. The chevron is a real button beside it, and "All products" is
   the same destination one row inside the open menu — which is what that row is
   for.
3. **The vodka section takes `productCover(product)`, not
   `product.featured_image`.** `featured_image` is a `SellqoImage`, not a
   string; `ProductImage` takes a string. Same value, correct type.
4. **No hand-written `<link rel="preload">` for the splash art.** The brief
   allowed either that or `fetchPriority="high"`; a preload in `__root` would
   cost every visitor 200 KB on every page, including the sessions where the
   splash never shows. `fetchPriority="high"` plus the `onLoad` gate does the
   job, and BR-4 already recorded that a hand-written preload fights React 19's
   own.

## Not touched

Frozen plumbing, `sellqo.functions.ts`, the product/cart/checkout paths,
`CheckoutForm`, every account screen, `routeTree.gen.ts`.

## Open questions for Sander

1. **The TikTok handle.** `https://tiktok.com/@bennyrich` is in the footer and
   in the Organization `sameAs`, unverified, and he did not mention it. It is
   deliberately left exactly as it was and **not** promoted to a constant in
   `src/lib/site.ts` — confirm it, correct it, or drop it.
2. **The original logo file.** The set was extracted from a WhatsApp JPEG. An
   AI/SVG/EPS would make `favicon.svg` a real vector again and stop the 512
   icon being a 5× upscale. Nothing else changes.
3. **The "shhh shield" is a guess.** None of `shh-kid-full.png`,
   `shh-kid-figure.png` or `shh-kid-ticket.png` is shield- or crest-shaped.
   `shh-kid-full` was chosen as the closest thing to a crest — figure, BR ring,
   wordmark and tagline in one stack. If he meant something else, it is one
   constant in `SplashScreen.tsx`.
4. **Responsible-drinking wording on the vodka section.** It currently carries
   "18+ · Enjoy responsibly." Belgian rules on alcohol advertising may want more
   than that, and it is his risk to price.
5. **The e-mail "variants".** Mail infrastructure, not this repo: `info@` is
   wired up here, but whether `info@`, `orders@` and `press@` exist and where
   they land is a DNS/mailbox question.
6. **A pink logo set** whenever he wants the 18+ gate to stop being the last
   drawn SVG on the site. One run of `docs/brand/tools/neon_alpha.py` over
   `docs/brand/logo-pink.jpg`.

## Carried forward, still open

- **Ad safety:** the rifle is still on the "Built different" banner at his
  documented request. Unchanged by this batch; the exposure written up in BR-2.1
  stands.
- **Vodka accijns** blocks purchase. `NOT_PURCHASABLE` holds it; deleting the
  slug now flips the product page _and_ the new homepage section.
- **Akke:** the DB image-URL reconcile to the Supabase bucket; `SITE_URL` still
  points at the Lovable preview; live end-to-end account pass against real core.
- `br-sunglasses` still has no image. BR-7's reshoot list stands. Sitemap still
  has no product URLs. Google Fonts still load before consent.

# BR-12 — homepage fill + revision round 2 (2026-08-26)

Date: 2026-08-26 · `main`: `869fb6c`…`662f819` · branch `br-12-home`:
`3bd43bd`…`50c0bd3` (**not merged**)

Two kinds of work, deliberately kept apart. Three corrections Sander has already
approved went straight to `main`. The homepage rebuild is a bet on his taste, so
it sits on a branch, behind one flag, and comes back out in one move.

---

## The reversal mechanism, and why it exists

The new homepage is a **go/no-go**, not a refactor. He may love it or reject it
wholesale, and "reject it" must not mean unpicking five commits.

`HOME_V2` in `src/lib/site.ts`:

```
true  -> Hero, CategoryTiles, FeaturedCollection, ShopTheRange,
         VodkaSpotlight, BrandStatement, BuiltDifferentBanner
false -> Hero, FeaturedCollection, VodkaSpotlight, BuiltDifferentBanner
```

**The `false` arm renders the ORIGINAL components, and BR-12 does not edit any
of them.** That is the whole point, and it is written into both `site.ts` and
`index.tsx`: the moment one of them gets "tidied up", flipping the flag stops
restoring what the client last approved. Proved rather than asserted:

```
VodkaSpotlight.tsx                     blob IDENTICAL to 9f37a883
Hero / FeaturedCollection / BuiltDifferentBanner   function bodies unchanged
HOME_V2=false  section order -> Featured Collection, Born in Belgium,
                                Built different       (nothing else)
home-v1-1280.png   2560x6544  — the same pixel dimensions as BR-11's home-1280
```

The flag was committed **first**, before anything was built on it, so the diff
for every later step is legible: everything that appears in `HomeV2` from that
commit on is new.

---

## The real API contract — read from source, and it moved twice

`~/Projects/sellqo/supabase/functions/storefront-api/index.ts` is on this
machine. Reading it instead of guessing corrected **three** assumptions, two of
which were in my own BR-11 mock:

|                                                | What live actually does                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `get_categories` (index.ts:281)                | returns a **bare array**, ordered by `sort_order`; `image_url` **is** in the contract; `sort_order` itself is not in the payload |
| `get_products` items (index.ts:658)            | `images: TEXT[]` — plain URL **strings** — and **no `featured_image` field at all**                                              |
| `get_product` / list items (index.ts:485, 673) | carry `category: {id,name,slug}` singular                                                                                        |

Consequences that changed the work:

1. **The brief said the tiles should use the first product's `featured_image`.
   That field does not exist on live.** They use `productCover()`, which falls
   through `featured_image ?? images[0]`. Nothing had to change in the frozen
   helpers — they were written defensively in BR-5/BR-7 and that is why nothing
   was broken by this all along.
2. **The 18+ gate was already wired.** See below.
3. `CATEGORIES` in `src/lib/categories.ts` has no `sort_order` field — it is a
   hand-fixed array and its order already is the order the brief asked for.

`tools/mock/` now mirrors all three. It also keeps two traps **on purpose**:
image URLs still 404 (so `ProductImage` really walks to `/products/…`), and
variants still carry `attribute_values` only (so `cart-labels.ts` is still doing
real work). Added: a product with `images: []` so the `hasArtwork()` skip is
exercised, and one category with `image_url` set to a 404ing URL so the tile's
precedence branch is live code rather than aspiration.

**Per-category counts now match the live catalogue** — apparel 9, accessories 1,
home 6, lighting 4, beverages 1 = 21 — so the tiles were reviewed against a
realistic catalogue. **Membership inside a category is a reconstruction** from
the committed seed images; I can match the composition but not the ordering,
because which product the API returns first depends on `created_at` and I cannot
query it. Each tile shows a real product from the right category and beverages
shows the vodka, but the exact "first" is not guaranteed identical to
production. One line per category from Akke fixes that and the shots are a
two-minute re-run.

---

## Straight to `main`

**TikTok is gone** — the `SOCIALS` entry, the hand-drawn glyph component (lucide
has none, so it was ours), its comment, and the `/contact` link. No constant, no
placeholder. `__root.tsx` derives `sameAs` from `SOCIALS`, so the structured
data dropped it on its own: `sameAs -> ['https://www.instagram.com/bennyrichstore']`.

**Email was already correct.** BR-11 routed every occurrence through
`CONTACT_EMAIL`; the sweep found no email-shaped literal anywhere in `src/` and
all six surfaces that show an address render exactly `info@bennyrich.com`. A
verification commit, no code change.

**The 18+ prompt already fired**, and building a second modal would have been
the wrong answer. Traced first: `get_product` returns `category.slug`,
`categorySlugsOf` already probes the `category` key, `beverages` is in
`AGE_RESTRICTED_CATEGORIES`, and `product.$slug.tsx:127-133` mounts the gate off
exactly that. Proved end to end from a cleared session at 390:

```
A  ctaHref=/product/br-vodka-700ml  gateCount=1  z=60  heading="18+"  bodyLocked
B  "I am 18 or older" -> gone, br_age_verified="1", scroll released
C  navigate away and back, same session -> reGated=false
```

`gateCount=1` is the assertion that matters. There is one 18+ gate on this site.

---

## Category tiles

Five tiles under the hero, `grid-cols-2 md:grid-cols-5`. They are **categories**
and nothing grander — the client was explicit, and the word he objected to
appears nowhere in `src/`.

Cover art resolves `category.image_url` first, then the first product with
artwork. **All five BennyRich categories have `image_url = NULL` today**, so in
practice every tile is product-derived. The first branch is not dead code:
uploading category art in the admin is a **zero-code upgrade** whenever Sander
wants it, and until then the tiles borrow from the catalogue.

Apparel is the proof the chain works: the mock gives that one category an
`image_url`, the tile requests it, it 404s like every bucket URL does today, and
`ProductImage` walks on to `/products/shh-tee-blue.jpg`.

Both degradations proved by breaking the mock on purpose:

```
every product image removed  -> beverages renders name + link, no <img>, emptyWells=0
mock stopped entirely        -> all five render names and links, emptyWells=0
```

An empty image well is worse than no image.

## "Shop the range"

> **Superseded — this section was removed in BR-12b.** What follows is the
> record of what was built and why; the row is no longer on the page.

Deliberately **not** framed as newly-arrived stock: every product was
bulk-imported on 18–19 August, so nothing is newer than anything else and that
framing would be a lie inside a week.

Selection reuses `pickSpread` and then **subtracts** rather than slicing blind —
drop what the featured grid shows, drop categories with their own section, take
four. Subtracting an explicitly-computed set keeps the rows disjoint if the
catalogue changes shape.

`pickSpread` prefix-stability was asserted rather than read off the source, since
the naive version of this depended on it:

```
live-shaped            prefixStable=true disjoint=true
thin (1 per category)  prefixStable=true disjoint=true  n4=4 n8=5
one category only      prefixStable=true disjoint=true
is_featured flag set   prefixStable=true disjoint=true
fewer than 8 total     prefixStable=true disjoint=true  n8=6
fewer than 4 total     prefixStable=true disjoint=true  n4=3
```

**Beverages is excluded because it has a section of its own.** The first cut put
the vodka in the grid and then again, full-width, two hundred pixels lower —
caught in the screenshot, not in review. It is also the one product that cannot
be bought, so a "Coming soon" card under a heading reading "Shop the range" was
the wrong promise twice over.

`src/lib/home-data.ts` (`useCategoryProducts`) holds the per-category fan-out for
the three new sections, keyed **identically** to the copy `FeaturedCollection`
inlines. A full homepage load with three sections reading per-category products
makes exactly **five** `get_products` calls, one per category, not fifteen.
`FeaturedCollection` keeps its own copy on purpose — it is one of the four
components the escape hatch restores and must not be edited by the batch it
exists to escape. If the keys ever drift the symptom is a doubled request count,
not a wrong render.

## Brand statement — the honesty calls

The obvious thing in that slot is a benefits strip: free shipping, easy returns,
secure checkout. **Every one of those would have been inventing a service.**

| Claim not made                    | The fact that made it a lie                           |
| --------------------------------- | ----------------------------------------------------- |
| shipping / delivery promises      | the tenant has **zero active shipping methods**       |
| "secure checkout", payment badges | `stripe_charges_enabled = false` — Stripe is not live |
| ratings, reviews, testimonials    | there are none                                        |
| "new arrivals"                    | every product dated 18–19 Aug (bulk import)           |

So the section is a typographic statement with no numbers, no window, no service
level. The copy is lifted **verbatim** from the existing `/about` body, so it is
voice the brand already has. No eyebrow — an eyebrow labels a shelf, and this is
the one beat on the page not selling one.

The rendered page was swept for fifteen claim patterns: **zero hits in `<main>`**.

Two code comments were reworded during the batch because naming a banned phrase
in a comment trips the very grep that proves it is absent. The reasoning stays
in the code; the literals live here instead.

## Found, not fixed

`collections.tsx:31` keys its query `{categorySlug, per_page: 1}` but requests
`per_page: 4`. The key lies about the params, and it is a **different** key from
`index.tsx:103`'s `per_page: 20`, so `/collections` and `/` refetch the same data
instead of sharing it. Out of scope for BR-12; worth a line in the next batch.

## Verification

`bun run build` + `bunx tsc --noEmit` green on both branches **and with the flag
both ways**.

```
grep -rn "tiktok|TikTok|hello@|worlds|werelden|New arrivals" src/   -> 0 hits
grep -ri aceternity src/                                            -> 0 hits
git diff 9f37a883 -- package.json bun.lock                          -> empty
```

Frozen files, empty diff **and** blob-hash identity (an empty diff alone can also
mean a mistyped path):

```
sellqo.ts 5842c2b1cae1 == 5842c2b1cae1     IDENTICAL
cart-context.tsx / checkout.ts / use-sellqo.ts / sellqo.functions.ts  IDENTICAL
src/integrations/** — all five files       IDENTICAL
```

`sellqo.functions.ts` was not touched at all — no proxy work in BR-12.

Screenshots in `docs/screens/BR-12/`: `home-v2-1280`, `home-v2-390`,
`category-tiles-1280`, `category-tiles-390`, `second-row-1280`,
`brand-statement-1280`, `vodka-gate-390`, and `home-v1-1280` — the escape hatch
proved, not asserted.

## Open item

**A real value strip is a short follow-up the day shipping methods are
configured and Stripe goes live** — and not before. Everything it would need
(the layout slot, the `quiet-frame` treatment, the section rhythm) is already
there; only the numbers are missing, and they have to be true.

## Open questions for Sander

1. ~~**Is "Shop the range" the label he wants** for the second product row?~~
   **Resolved in BR-12b: the row is gone.** Akke's review answered a question
   nobody had asked — not the label, the row itself.
2. **Is the brand-statement copy on-voice?** It is his own About copy verbatim,
   but it is doing a different job on a homepage.
3. **Shipping and Stripe timeline** — that unblocks the value strip, and it is
   the last thing standing between this storefront and taking money.
4. **Category art**: five images in the admin and the tiles stop borrowing from
   the catalogue. Zero code.

# BR-12b — the second product row comes back out (2026-08-26)

Date: 2026-08-26 · branch `br-12-home` · **not merged**

Akke reviewed the V2 homepage and cut "Shop the range". It read as a
near-duplicate of the Featured Collection grid directly above it — two four-up
product grids back to back, same cards, same rhythm, no distinct reason to buy
from one rather than the other. Discovery was already covered: the category band
gives five entry points into the catalogue, which is a different job from a
second helping of the same four-up.

**This is the flag doing its job.** The row was built in one commit and removed
in the next, and neither move cost anything beyond the commits themselves,
because `HOME_V2` meant the whole stack was disposable from the start. The thing
that made the duplication visible was a screenshot, not a code review — which is
why `docs/screens/BR-12/second-row-1280.png` is **kept** rather than deleted.
Removing the evidence would erase the reason.

## What went

`src/components/site/ShopTheRange.tsx`, entirely. The selection logic the brief
described — the deep `pickSpread` pool minus the featured set minus categories
with their own section, plus `HAS_OWN_SECTION` and the `ALREADY_SHOWN`/`COUNT`/
`POOL` constants — all lived inside that one file, so it went with it. Two lines
in `src/routes/index.tsx` (import and render) and one corrected list in
`src/lib/site.ts` were the rest of it.

**Nothing was orphaned.** Every shared import it used still has other consumers,
checked before deleting rather than after:

```
pickSpread            -> index.tsx:121 (FeaturedCollection)
useCategoryProducts   -> CategoryTiles.tsx:50
ProductCardSkeleton   -> index.tsx, CategoryProductsPage.tsx
SpotlightCard         -> index.tsx
```

## What stayed, and why

`src/lib/home-data.ts` (`useCategoryProducts`) is down to **one** caller,
`CategoryTiles`. It stays, and its doc comment was rewritten to stop claiming
three — the point was never the number of callers. Its query key is deliberately
identical to the one `FeaturedCollection` inlines, and that is what makes the
tiles and the featured grid share one React Query cache entry per category. The
homepage makes five requests instead of ten because of it.

## The escape hatch is untouched

`HomeV1` was not edited, and the four components it renders are still
blob-identical to base. Both arms build. Asserted rather than assumed:

```
HOME_V2=true   headings -> Shop by category, Featured Collection,
                           Born in Belgium, We do not follow, Built different
               sections -> 6
HOME_V2=false  headings -> Featured Collection, Born in Belgium, Built different
               sections -> 4
```

**No dead space where the row was.** The junction is now Featured Collection
(`br-section`, top+bottom) → VodkaSpotlight (`br-section-b`, bottom only), which
is exactly the junction `HomeV1` has always had. Measured in both arms:
`featuredToVodkaGapPx = 0` either way, i.e. the same spacing the client already
approved. The page went from 9276px to 8230px at 1280.

## Verification

```
bun run build / bunx tsc --noEmit          green, flag BOTH ways
grep -rn "Shop the range|More from the collection|ShopTheRange" src/   0 hits
grep -ri aceternity src/                                               0 hits
git diff 9f37a883 -- package.json bun.lock                             empty
frozen files: empty diff AND blob-hash identical (all ten paths)
```

`home-v2-1280.png` and `home-v2-390.png` re-shot against the tightened page.

# BR-14 — hero category nav, the band below the vodka, the rifle off (2026-08-27)

Date: 2026-08-27 · `main`: `6f71a9e`…`b754902` · base `6eaa043`

Three client-requested corrections from Sander's review of the live V2
homepage. Two are placement, one is a taste bet — and the taste bet is the only
one behind a flag.

## What changed

1. **The hero's "Shop now" button becomes category navigation.** Six pills:
   All, then the five categories. Behind `HERO_CATEGORY_NAV`.
2. **The category tile band moves below the vodka**, so the page leads on
   product rather than on navigation. No flag: placement, not a gamble.
3. **The rifle banner comes off the homepage**, hidden behind
   `SHOW_RIFLE_BANNER = false`. Not deleted.

## The hero decision, and why it is not a fork

`Hero` is **one component shared by both `HOME_V2` arms**. CLAUDE.md's rule for
the four false-arm components is "if you need to change one, copy it", so the
obvious move was a `HeroV2` fork. It was rejected, deliberately, and the
reasoning is worth keeping:

- A fork duplicates ~50 lines including `Spotlight`, `TextReveal` and the LCP
  `<img fetchPriority="high">` with the hard-won comment above it. Two heroes
  then drift the first time someone edits the copy in one of them.
- A fork also needs its own `HERO_CATEGORY_NAV === false` branch, which is a
  **third** copy of the "Shop now" button.

Instead `Hero` takes one optional `cta` prop whose default **is** the original
button. `HomeV1` still calls `<Hero />`, so the false arm renders what it always
did, and `HERO_CATEGORY_NAV = false` is not a copy of the button — it is the
button, so the two states cannot disagree.

**The cost, stated plainly:** the guarantee is now "nobody moves that default"
rather than "the file cannot change". That is a weaker guarantee than the rule
intends, which is why it is recorded on the flag, in `CLAUDE.md`, and here. It
was verified rather than asserted — see below.

## The reorder was not free

`br-section-t`/`-b` is **positional**: sections pad one side so adjacent gaps do
not double. Moving the band exposed two defects, one of them pre-existing.

Measured at 1280×900 (so `clamp(80px, 12vh, 160px)` resolves to 108px):

| Junction                 | Before BR-14            | After        |
| ------------------------ | ----------------------- | ------------ |
| Hero -> next             | 108                     | 108          |
| Featured -> Vodka        | 108                     | 108          |
| Vodka -> next            | **216 (doubled)**       | 108          |
| band -> BrandStatement   | —                       | 108          |
| BrandStatement -> Banner | **0 (panels touching)** | 0, preserved |
| last -> footer           | 188                     | 188          |

- The **doubled** Vodka junction has shipped since BR-12 and is visible in
  `docs/screens/BR-12/home-v2-1280.png` as an oversized black band above "We do
  not follow". A naive reorder would have moved it, not fixed it.
  `VodkaSpotlight` is frozen, so the correction lands on `CategoryTiles`, which
  now inherits its top gap from the neighbour above — exactly how
  `VodkaSpotlight` itself inherits its own from `FeaturedCollection`.
- **BrandStatement becomes the last section** when the banner is off, and had no
  bottom padding, so the page would have ended 80px above the footer hairline
  instead of 188px. It takes a `last` prop. The flag is read at the **call
  site**: a component whose padding reaches for a sibling's feature flag is the
  coupling that rots first. Giving it `br-section` unconditionally was simpler
  and was rejected — it would have changed what `SHOW_RIFLE_BANNER = true`
  restores, and one-line reversibility is the point of the batch.

The touching-panels junction is left at 0 on purpose. It is what the client
reviewed, and turning the banner back on has to restore it exactly.

## The ad-safety flag is closed, for now

Firearm imagery on the landing page has been an open exposure since **BR-2.1**:
Meta and TikTok both review the landing page, not only the creative, so anything
pointing paid social at `/` inherited it. BR-2.1 removed a rifle for that reason;
2026-08-24 put one back at Sander's documented request; every batch since has
carried it forward under "still open".

**While `SHOW_RIFLE_BANNER = false`, `/` is ad-safe.** The exposure is not
resolved, it is dormant — the component and `public/hero/rifle-blue.png` are
both still in the repo, and turning the flag back on reopens it. That is written
on the flag itself so it is a decision rather than an accident.

## Found, not fixed by request

`src/styles/tokens.css` carried `"FIVE WORLDS"` in a section-eyebrow comment,
left there by BR-2.1. "Worlds" is banned wording since BR-12, and CLAUDE.md
publishes `grep -rni "worlds\|werelden" src/` as a standing check — which was
therefore returning **1, not 0**, and had been since the rule was written. The
comment now names an eyebrow that actually exists. The check returns 0.

(Earlier batches recorded this check as passing. It passes case-sensitively;
the documented form is case-insensitive, and `WORLDS` was uppercase.)

## Verification

```
bun run build / bunx tsc --noEmit    green at every commit, all three flags both ways
frozen files                          empty diff AND blob-hash identical (all ten paths)
git diff 6eaa043 -- package.json bun.lock   empty
grep -rni "worlds|werelden" src/      0  (was 1 — see above)
grep -ri aceternity src/              0
```

The escape hatch is proved at source level, not asserted: `HomeV1`,
`FeaturedCollection` and `BuiltDifferentBanner` are **byte-identical** to
`6eaa043`, `VodkaSpotlight.tsx` is **blob-identical**, and `Hero` is identical
once the two intended edits — the signature and the `cta ??` wrapper — are
reversed. Nothing else in it moved.

Rendered, over CDP against the mock:

```
HERO_CATEGORY_NAV=true    6 pills, hrefs /shop + /shop?category=<slug> x5,
                          2 rows at 1280, nav width 552px, no button in the hero
HERO_CATEGORY_NAV=false   button back in the hero, 0 pills
SHOW_RIFLE_BANNER=true    "Built different" returns; BrandStatement->Banner = 0,
                          last->footer = 188 (both unchanged from BR-12)
SHOW_RIFLE_BANNER=false    page ends at BrandStatement, last->footer = 188
HOME_V2=false             headings -> Timeless, Featured Collection,
                          Born in Belgium, Built different; rhythm 108/108/108/188
```

Page height at 1280 went from 8230px to 7078px.

Screenshots in `docs/screens/BR-14/`: `hero-pills-1280`, `hero-pills-390`,
`home-1280`, `home-390`, `category-band-below-vodka-1280`, and `home-v1-1280` —
the escape hatch shot, same 2560x6544 as BR-12's.

## Open questions for Sander

1. **Is the pill row too quiet?** The pills are the /shop filter chip: hairline
   `--br-line` border, `--br-mute` label, blue only on hover. That is correct
   per the design system and consistent with the chips on the next page, but it
   means the hero no longer has a lit call to action where a blue "SHOP NOW"
   button used to be. Making the row blue at rest, or lighting only the "All"
   pill, is a one-line change if he wants the hero to pull harder.
2. **Category nav now exists in two forms** — pills in the hero, tiles below the
   vodka. They were kept deliberately, because text links and image tiles do
   different jobs, but confirm it does not read as redundant to him. BR-12b
   removed a section for exactly this reason.
3. **Does the banner slot get reused?** It is hidden, not deleted. If nothing is
   going in it, deleting the component and the artwork is the honest follow-up.
4. Carried forward, unchanged by this batch: shipping and Stripe (which unblock
   the value strip), the DB image-URL reconcile, `SITE_URL` still on the Lovable
   preview host, `br-sunglasses` still has no image, the reshoot list from BR-7,
   no product URLs in the sitemap, Google Fonts still load before consent.

# BR-14b — the hero pills get a lit rest state (2026-08-27)

Date: 2026-08-27 · `main` · base `d19ea3a`

BR-14 shipped the hero pills in the `/shop` filter chip's resting look: a
`--br-line` hairline, a `--br-mute` label, blue only on hover. That was correct
per the design system and consistent with the chips a shopper meets on the next
page — and it was flagged in BR-14's own open questions as reading too quiet,
because the pills are now the hero's **only** call to action and they replaced a
lit blue button.

Sander confirmed it. The pills are lit at rest.

## What the rest state is now

`neon-btn`'s, exactly: a `--br-blue` border with the house 5px/40% halo and a
`--br-blue-text` label on a transparent ground. That is not an approximation of
the old "Shop now" button — it _is_ what that button was, which is what makes it
the right answer to "read as lit, like the old button did".

The chip parity BR-14 argued for is therefore given up on purpose. The hero and
the `/shop` chips no longer match at rest. That trade was the client's call: a
hero CTA that pulls is worth more than a resemblance to a filter control one
page away.

## Hover had to move

Lighting the rest state costs the old hover — the pill was already blue, so
`hover:neon-line-blue` became a no-op and hover would have been invisible. Hover
now takes `neon-btn`'s 8% blue ground wash and brightens the label to
`--br-white`. Border and halo deliberately stay put: two layers maximum, and no
glow is animated.

Verified as computed style rather than by eye, at 1280 over CDP:

```
REST   color #4A7DFF (--br-blue-text)   border #1E5BFF (--br-blue)
       box-shadow 0 0 5px blue/40%      background transparent   radius 2px
HOVER  color #F4F4F6 (--br-white)       border #1E5BFF (unchanged)
       box-shadow unchanged             background blue/8%
changed on hover: color, background
```

## The contrast rule held

The label is `--br-blue-text` (5.50:1), never `--br-blue` (3.88:1 at 11px, fails
AA). That is the same deviation from the `/shop` chip that BR-14 recorded — the
chip's _active_ state uses `--br-blue` at 11px and is the thing not to copy. It
matters more now, not less, because the label is blue at rest rather than only
on hover.

## Scope

One constant in `src/routes/index.tsx`, `HERO_PILL`, plus its doc comment.
Asserted rather than assumed: `HomeV1`, `HomeV2`, `Hero` (including the
`HERO_CATEGORY_NAV = false` button branch), `FeaturedCollection`,
`BuiltDifferentBanner` and `HeroCategoryNav` are all **byte-identical** to
`d19ea3a`. Frozen files remain blob-identical to `6eaa043`; no dependency change.

The arbitrary `hover:bg-[color-mix(...)]` class is the first of its kind in the
JSX — every other `color-mix` in the project lives in `tokens.css`. It was
confirmed to actually emit a rule in the built stylesheet rather than being
silently dropped by the scanner, which is the failure mode worth checking for an
arbitrary value with commas and parentheses in it:

```
hover\:bg-\[color-mix\(in_srgb\,var\(--br-blue\)_8\%\,transparent\)\]:hover
  { background-color: color-mix(in srgb,var(--br-blue) 8%,transparent) }
```

If a third pill state is ever needed, that is the point to stop and put a
`neon-pill` utility in `tokens.css` beside `neon-btn` instead.

## Screenshots

`docs/screens/BR-14/hero-pills-1280.png` and `hero-pills-390.png` re-shot
against the lit state, plus `hero-pills-hover-1280.png` — a real hover, driven
with `Input.dispatchMouseEvent`, since `tools/screens/capture.ts` has no mouse.

# BR-16 — the gallery was never dark, and the shop header follows the category (2026-08-28)

Date: 2026-08-28 · `main`: `4e14dca`…`5020149` · base `a1628cc`

## Fix 1 — the product gallery

Sander reported product-page images rendering near-black while the same photos
are bright on `/shop`. **Nothing was dimming them.** The brief proposed three
candidates and all three are false; they were eliminated by reading the code
before anything was touched:

| Candidate                                        | Why it is false                                                                                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProductImage` tints/blends when `colour` is set | It is a plain `<img>` with a `className` passthrough. No tint, filter, blend, opacity or overlay in the file.                                               |
| `colourFromLabel` / `colour` drives a treatment  | `colour` feeds `imageSources()` only. It reorders **which file is requested**, never how it renders.                                                        |
| `.br-media-contain` adds a dark ground or blend  | It sets `object-fit` and (formerly) `padding`, nothing else. The 6% `.br-media::after` vignette is on **both** surfaces, so it cannot explain a difference. |

A repo-wide sweep found exactly one pixel-darkening mechanism, `opacity-40`,
and it sits **identically** on both surfaces (`ProductCard.tsx:54`,
`product.$slug.tsx:275`) behind the same `isSoldOut`. It dims the grid card too,
so it cannot darken one surface and not the other. Ruled out at runtime as well,
not just by argument: computed `opacity` is `1` and `className` is empty on the
gallery image.

### The cause

```css
.br-media-contain > img {
  object-fit: contain;
  padding: 8%;
}
```

in a well fixed at `aspectRatio: 1 / 1`. **Geometry, not pixels.** Percentage
padding resolves against the containing block's **width on all four sides**, so
the content box was 84%×84% before `contain` even ran. A portrait photo then
painted onto ~56% of a square well, and the other ~44% was solid `--br-black`.
Next to the `cover` grid card — which fills 100% and crops to the bright neon
centre — that reads as a near-black tile. Same file, same pixels, fewer of them.

### The fix, measured

`padding: 8%` removed. Painted image area as a share of its well, measured over
CDP rather than eyeballed:

| Surface                                       | Before | After     |
| --------------------------------------------- | ------ | --------- |
| gallery — panther-tee, 1122×1402, square well | 56.0%  | **79.4%** |
| vodka — 1060×1484, `4 / 5` well               | 67.5%  | **88.7%** |

The gain is a flat **×1.417 at every aspect ratio** (`0.84² = 0.7056`), so the
catalogue moves together. Across the 17 new photos the range is 66.7%–100%; the
weakest is the countach hoodie, purely because it is a 1.50 landscape front+back
shot in a square well, and it is already on BR-7's reshoot list.

`contain` and the `1 / 1` well are **kept**. BR-7 chose them so back-print
artwork is never cropped, and that reasoning stands — only the padding was wrong.

### VodkaSpotlight changes too, on purpose

`.br-media-contain` has two call sites. Removing the padding enlarges the
homepage bottle by +31%. That is intended: one bug in one shared utility, and
two surfaces using the same utility should render the same way. Scoping the fix
to the gallery would have left one surface disagreeing with the utility it uses.
Confirmed as an improvement against a before/after capture before shipping.

**What this does to the escape-hatch guarantee, stated plainly.**
`VodkaSpotlight.tsx` stays **blob-identical** — only the shared CSS moved, and
`tokens.css` was never frozen — so the frozen-file check is still clean. But its
_rendering_ changes on both `HOME_V2` arms. So the guarantee is now:
`HOME_V2=false` restores the same **components and layout** the client approved,
**not a pixel-identical media fill**. This is a deliberate global media-quality
fix, not silent drift. Nobody should read the tighter fill as the escape hatch
having rotted.

## Found, NOT fixed — the fallback walk is dead on the product page

Reproducible, and worth more attention than this batch could give it. The
`<ProductImage>` candidate walk documented in `CLAUDE.md` **does not run on
`/product/:slug` when the page is loaded directly**:

```
/shop grid              walk advances -> /products/panther-tee-blue.jpg   ok
/ home                  walk advances                                     ok
/product/panther-tee    NEVER advances -> stuck on the failed bucket URL, naturalWidth 0
```

The differentiator is the **route loader**. `/product/:slug` has one, so the
`<img>` exists in the first client render and the image error fires before React
attaches `onError`; `/shop` and `/` get their data from a client `useQuery`
_after_ hydration, so the handler is always attached first. Proof: reaching the
same product by **client-side navigation** (clicking a card on `/shop`) makes
the walk succeed every time.

**Consequence:** any product whose bucket URL fails renders an empty black well
on the product page — which is indistinguishable from "the image is very dark",
and is a plausible second explanation for what Sander saw. It is dormant only as
long as every bucket URL resolves.

Not fixed here because it is a different defect in a different file, and the
brief scoped this batch to the darkness. It wants its own change (an `onLoad`/
`complete` check after mount, or keying the `<img>` so the walk re-arms).

## Fix 2 — the shop header follows the category

`/shop` hardcoded one header for every view, so filtering to Lighting still said
"Shop". `CATEGORY_HEADERS` in `src/routes/shop.tsx`, keyed by the slugs in
`src/lib/categories.ts`, now supplies eyebrow, title and lede.

The eyebrow stays "Shop" and the title carries the category name. The brief
suggested both be the category word; the default pairs a set descriptor with a
page name ("All pieces" / "Shop"), so category views keep that shape rather than
printing "Apparel" twice.

`BrCategory.blurb` was deliberately **not** reused — it is written for the
`/collections` tiles, a different slot with a different voice. `categories.ts`
stays the single source of **slugs**; the copy lives with the route. The ledes
promise no service (no shipping, returns, ratings or "new arrivals"), and they
are categories and nothing grander.

A search keeps the default header: `CategoryProductsPage` already prints
`Results for "…"` under the chips, and a query is not a category. An
unrecognised slug falls back to the default rather than rendering an empty one.

### Why per-category `head()` meta was declined

`head()` _can_ read search in this version (via `match.search`), so this was a
choice, not a limitation. `/shop` emits an unconditional `canonical("/shop")`,
which is correct and protective — every `?category=` and `?q=` permutation
collapses to one indexable URL. Giving `?category=apparel` its own title while
it still canonicalises to `/shop` tells a crawler the page _is_ `/shop`; the
per-category meta is then discarded, so the work buys nothing and leaves the
page contradicting itself.

**Follow-up if category views should be indexable:** self-referential canonicals
per filter, `q` excluded (search results should not be indexed, and
`public/robots.txt` disallows only `/checkout` and `/account`), plus adding the
category URLs to `src/lib/sitemap.ts`, which lists five paths today. Not done.

## Verification

```
bun run build / bunx tsc --noEmit                    green
frozen files                                          empty diff AND blob-hash identical (all ten)
VodkaSpotlight.tsx                                    blob-identical to base
git diff a1628cc -- package.json bun.lock             empty
grep -rni "worlds|werelden" src/                      0
git status -- public/products/                        17 entries, unstaged, before AND after
```

Headers asserted rendered, all six states plus a live chip click:

```
/shop                    All pieces / Shop / Built for people who stand out…
/shop?category=apparel   Shop / Apparel / Heavyweight tees and hoodies…
/shop?category=lighting  Shop / Lighting / Neon-lit 3D lamps…
/shop?category=beverages Shop / Beverages / The bottle of the house. 18+.
/shop?q=panther          default (unchanged)
/shop?category=nonsense  default (fallback)
click "Lighting" chip    header updates live
```

Screenshots in `docs/screens/BR-16/`.

## The stray photo copies

`public/products/` carries 9 modified and 8 new files — Sander's better photos,
already serving from the Supabase bucket. The storefront loads from the bucket,
so these local copies are strays and **were not committed**. Everything in this
batch was staged by explicit path; `git add -A` was not used. `git status` shows
the same 17 entries before and after both commits.

They were used for **measurement only**, which is why the aspect-ratio table
above is trustworthy for what actually ships.

# BR-LOGO-VODKA — the official lockup says VODKA (2026-10-05)

Client-supplied replacement of the official neon logo. The new lockup reads
**BENNY RICH · VODKA** where it read **WORLDWIDE**. Akke generated the assets
with `docs/brand/tools/neon_alpha.py` + pngquant and placed them in
`public/brand/`; they were **not** regenerated in this batch.

| File                               | Before  | After                           |
| ---------------------------------- | ------- | ------------------------------- |
| `logo-lockup-blue.png`             | 775×317 | 829×395                         |
| `logo-wordmark-blue.png`           | 775×117 | 829×125                         |
| `logo-monogram-blue.png`           | 157×136 | 217×194                         |
| `logo-wordmark-vodka-blue.png`     | —       | 829×201 (reserve, not wired up) |
| `logo-wordmark-worldwide-blue.png` | 775×181 | deleted (was never wired up)    |

`docs/brand/logo-blue.jpg` (the source render) was overwritten with the new
one; it does not belong in `public/`.

Code: `Wordmark.tsx` cap height 94px in both crops
(`94/395`, `94/125`); `Monogram.tsx` ring 163px (`163/194`).

## Visual check after publish — required

- **The monogram is relatively larger in its crop**: the ring was 74% of the
  crop height (101/136) and is now 84% (163/194). Because `size` means the
  ring diameter, every `<Monogram size>` call site now gets a _smaller_ box
  around the same ring — check spacing wherever it is used.
- The lockup is taller in proportion (829×395 vs 775×317), so the footer's
  `h-32 md:h-40` lockup renders narrower at the same height. Check footer
  and 404.
- Header and mobile menu (inline wordmark, cap height preserved by the
  `size` maths).
- The 18+ gate is unchanged — it still renders the drawn pink SVG; there is
  still no pink asset set.

## Open, not done here

- **`/hero/og-image.jpg` and the favicon set** still derive from the old
  WORLDWIDE lockup / old monogram crop. Regenerate in a follow-up.
- **`neon_alpha.py` still writes `logo-wordmark-worldwide-<tone>.png`** (name
  and docstring). Re-running it brings the deleted file back under the old
  name; rename that output to `-vodka-` before the next run.
- A full brand reading "VODKA" on an apparel/lighting storefront is the
  client's call, recorded here as a decision.
- `public/products/` again carries modified and new photo files
  (including `fuck-you-tee-*` and `*-model-*` names that do not fit the
  `<slug>-<colour>.jpg` fallback). **Not committed** — staged by explicit
  path only.
