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
