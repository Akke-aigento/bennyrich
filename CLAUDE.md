# BennyRich storefront

Neon-on-black storefront for BennyRich (New York). Remixed from the Zona Dorata
storefront; all of that brand's assets, routes and copy were stripped in BR-2.

## Stack

- **TanStack Start** (React 19 + TanStack Router, file routes in `src/routes/`)
- **Tailwind CSS v4** — configured in CSS, **there is no `tailwind.config.js`**.
  Theme lives in `src/styles.css` (`@theme inline`); brand tokens and utilities
  live in `src/styles/tokens.css`.
- **shadcn/ui** primitives in `src/components/ui/` (radius forced to 2px)
- **bun** for install/dev/build. `bun run build` must be green before pushing.
- Deployed through **Lovable** (project `2abe3881`). Commits pushed to `main`
  sync back into the Lovable editor, so keep `main` in a working state and
  never rewrite pushed history.

There is **no `index.html`** — TanStack Start owns the document. Title, meta,
favicon and font links are in `src/routes/__root.tsx` under `head()`.

## Hard rules

**Do not modify these files.** Read them and reuse them. If a UI need seems to
require changing one, stop and report instead of editing:

- `src/lib/sellqo.functions.ts`
- `src/lib/sellqo.ts`
- `src/lib/cart-context.tsx`
- `src/lib/checkout.ts`
- `src/components/site/CheckoutForm.tsx`
- `src/integrations/**`

Also:

- **Never call SellQo directly from the client.** Everything goes through
  `sellqoProxy`.
- **Never recompute prices client-side.** Render exactly what the API returns —
  the cart response is the single source of truth.
- **English only. EUR. nl-BE formatting** — comma decimals, symbol tight:
  `€69,99`. Use `formatEUR` from `src/lib/format.ts`.
  (`src/lib/sellqo.ts` also exports a `formatEUR`, but it is frozen and formats
  it-IT — `69,99 €`. Do not use it.)
- Work on `main`, commit per step.

## How sellqoProxy is used

`sellqoProxy` (`src/lib/sellqo.functions.ts`) is a TanStack **server function**.
It reads `SELLQO_API_URL` / `SELLQO_API_KEY` / `SELLQO_TENANT_ID` from the
server environment (Lovable Cloud secrets — they are not in the repo) and
translates REST-shaped calls into the SellQo storefront action protocol
(`POST { action, tenant_id, params }`).

Call it from the client via `sellqoFetch` in `src/lib/sellqo.ts`:

```ts
sellqoFetch<ProductsResponse>("/products", { query: { category_slug: "apparel" } });
sellqoFetch(`/products/${slug}`);
sellqoFetch("/categories");
sellqoFetch("/contact", { method: "POST", body: { name, email, message } });
```

Convenience hooks wrapping the common reads live in `src/lib/use-sellqo.ts`
(`useProducts`, `useCategories`, `pickFeatured`).

**Local development:** the API key is a Cloud secret, so a plain `bun run dev`
cannot reach SellQo. To exercise the storefront locally, point the proxy at a
local mock:

```
SELLQO_API_KEY=mock SELLQO_TENANT_ID=<tenant> \
SELLQO_API_URL=http://localhost:8788/functions/v1/storefront-api bun run dev
```

(The proxy only accepts a URL containing `/functions/v1/storefront-api`.)

## Design system

Black canvas everywhere, with restrained neon on top of it — signage seen from
across a quiet room, not a lit sign in your face. Tokens: `src/styles/tokens.css`.

| Token            | Value     | Role                                          |
| ---------------- | --------- | --------------------------------------------- |
| `--br-black`     | `#050505` | page background                               |
| `--br-ink`       | `#0B0B0D` | surfaces: cards, image wells, inputs          |
| `--br-line`      | `#1C1C22` | hairlines                                     |
| `--br-white`     | `#F4F4F6` | primary text (18.6:1 on black)                |
| `--br-mute`      | `#8A8A94` | secondary text (5.96:1 on black — AA passes)  |
| `--br-blue`      | `#1E5BFF` | default UI accent                             |
| `--br-blue-core` | `#0F55C9` | inner core of the blue glow                   |
| `--br-pink`      | `#FF2D8A` | emphasis, sale/attention, pink-variant pieces |
| `--br-pink-core` | `#C8287C` | inner core of the pink glow                   |
| `--br-rose`      | `#F06CA6` | soft pink, home-decor accents                 |

### Glow

Every halo in the system derives from **one variable**, `--glow-scale` in
`tokens.css`. Radii and alphas are `calc()`ed from it, so there is exactly one
number to turn: `1` is the tuned maison setting, `0` is flat colour, `2` is
roughly the old signage look.

Two layers maximum — a 1px core and a soft halo. There is no third outer bloom
and no glow is ever animated.

| Surface       | Halo                  |
| ------------- | --------------------- |
| `neon-text-*` | 1px core + 6px / 55%  |
| `neon-hero-*` | 1px core + 10px / 62% |
| `neon-line-*` | 5px / 40%             |
| `logotype-*`  | 3px / 30%             |

The header and footer lockups use `logotype-blue` and
`<Monogram intensity="logotype">`: near-solid colour with the faintest halo. A
logo has to read as print at 18px, so the wordmark is **not** outlined and does
**not** carry the full glow. `quiet-frame` is the hairline-plus-inner-breath
frame used where a panel needs definition without becoming a lit box.

### One accent per component

A component picks **one** neon colour and stays with it, and blue is the
default. **Never gradient blue → pink on a single element.**

Pink appears on **emphasis words, sale/attention states and pink-variant
products, and nowhere else**. Concretely that is: "LUXURIOUS." and "Made to
stand out.", the "View all" accent from the mock, the 18+ interstitial, form
errors, the "Remove" hover in the bag, and the bag count badge. It is never a
large surface or frame — the homepage banner is a `--br-line` hairline, and the
Beverages collection tile is blue like every other tile.

### Typography

- **Bodoni Moda** 500/600 — wordmark, headings, prices. Uppercase; tracking
  `.06em` on headings, `.2em` on the wordmark.
- **Inter** 400/500 — body, nav, labels. Nav is uppercase 11px, tracking `.24em`;
  section eyebrows (`br-section-label`) are 11px, tracking `.28em`.
- The tagline "TIMELESS. BOLD. LUXURIOUS." is always Inter uppercase,
  tracking `.3em`.
- Hero type is `clamp(36px, 6vw, 76px)`; page headings `clamp(26px, 4.2vw, 46px)`.

Both are loaded from Google Fonts (both OFL) in `__root.tsx`.

### Utilities

Defined with Tailwind v4's `@utility` (not a raw `@layer utilities` block) so
they compose with variants like `group-hover:`:

`neon-text-blue|-pink`, `neon-hero-white|-blue|-pink`, `neon-line-blue|-pink`,
`neon-glow-blue|-pink` (SVG line art), `logotype-blue|-pink` and
`logotype-glow-blue|-pink` (lockups), `quiet-frame`, `neon-btn`
(+ `neon-btn-pink`), `br-display`, `br-nav`, `br-section-label`, `br-label`,
`br-tagline`, `br-price`, `br-shell`, and `br-section` / `-t` / `-b`
(`clamp(80px, 12vh, 160px)` of vertical rhythm from one place).

Buttons are **ghost only** — transparent ground, 1px neon border. The mock
never uses a filled button.

> When a hover utility must beat a base border colour, set the base colour with
> a class (`border-br-line`), not an inline `style` — inline styles win over
> the hover utility and the frame silently stops lighting up.

### Motion

Only opacity/glow transitions, 200ms. Hover lift never exceeds 2px. Radius maxes
out at 2px (shadcn's `rounded-lg` defaults are overridden in `styles.css`).
**Nothing pulses** — the neon is steady and no glow is ever animated. The header
is the one exception to "no movement": it picks up a `blur(12px)` frosted ground
once the page scrolls past 8px. `prefers-reduced-motion` switches transitions off.

## Product images: the local fallback convention

The SellQo product rows point at Supabase bucket URLs that are **not live yet**
(reconciling them is Akke's side; see `docs/role-audit.md`). Until then:

- The 26 seed images are committed to `public/products/`, named
  `<slug>-<colour>.jpg` (e.g. `panther-tee-pink.jpg`).
- `<ProductImage>` (`src/components/site/ProductImage.tsx`) walks a candidate
  list: the API URL first, then `/products/<slug>-<colour>.jpg`, then
  `-blue`, `-pink`, and the bare `<slug>.jpg`. Each `onError` advances one step.
- Two seed filenames do not match their product slug and are aliased explicitly
  in `src/lib/product-image.ts`:
  `distressed-logo-tee → distressed-tee`, `br-vodka-700ml → vodka`.
- When the bucket URLs go live nothing needs changing — the API URL simply
  succeeds first and the fallback never fires.

Every cover sits in a `.br-media` well: pure `--br-black` ground, `object-fit:
contain`, 8% padding and a 6%-opacity radial vignette, so covers stay
consistent and a residual dark edge dissolves instead of forming a seam. This
is calibrated for **black-background photography** — it cannot hide a pure
white field, and as of BR-2.1 seven of the 26 seed images are still white (see
docs/role-audit.md).

The raw seed bundle (`seed/`) is gitignored; only `public/products/` and
`docs/brand/` are tracked.

## Brand artwork

`public/hero/` holds the real artwork, transparent PNGs that carry their own
glow — so they take **no** `neon-glow-*` filter on top. Two are wired up:

- `shh-kid-figure.png` (787×872) — the homepage hero. It is the LCP element, so
  it carries `fetchPriority="high"`; React 19 hoists its own
  `<link rel="preload" as="image">` from that, and adding one by hand only
  duplicates it at a lower priority.
- `panther-blue.png` (875×673) — the "Built different" banner, under a
  `radial-gradient` mask so its square edge dissolves into the black.

`shh-kid-full.png` and `shh-kid-ticket.png` are committed but unused.

Because the glow is baked into the raster, **these two elements no longer track
`--glow-scale`.** That is the accepted cost of real art over line art.

### The line art, parked

`shh-kid.svg` and `panther.svg` are plain SVG files inlined via `?raw` in
`LineArt.tsx`, so a single file stays the source of truth while `currentColor`
and the neon glow filter still apply to the strokes. They were the homepage
stand-ins until BR-4 and are **kept but no longer rendered anywhere**.

`rifle.svg` is likewise in the repo and deliberately **not** wired up — it read
as a club flyer on the homepage banner and is not ad-safe.

To bring any of the three back on a product page, import it the way the panther
used to be imported in `src/routes/index.tsx`.

## Age gate

Products in the `beverages` category show an 18+ interstitial before the
product page renders, once per browser session (`sessionStorage`, key
`br_age_verified`). See `src/components/site/AgeGate.tsx` and
`AGE_RESTRICTED_CATEGORIES` in `src/lib/categories.ts`.

## Effect components (`src/components/kit/`)

`src/components/kit/` holds three small effect components used on the homepage:
`Spotlight` (ambient light behind the hero), `SpotlightCard` (cursor-following
glow on a product card) and `TextReveal` (word-by-word settle on the tagline).

**They are our own code, with no runtime dependencies** — plain CSS plus a few
lines of React. Their keyframes live in `tokens.css` under
`--- Ambient light + reveal (BR-4) ---`, and `src/components/kit/README.md`
documents each one.

They obey the design system like everything else: every alpha is a `color-mix`
over a brand token so they ride `--glow-scale`, all three are blue, and radius
never exceeds 2px.

**Motion.** The spotlight drift is the one continuous movement on the site
besides the header, and it is permitted as *ambient light*, not an animated
glow — two washes travelling 60px over 14s and 18s. Nothing pulses,
`TextReveal` runs once on mount and holds, and the card glow is a 200ms hover
transition. Each component switches its animation off **by name** under
`prefers-reduced-motion` and renders its rest state; the global duration crush
in `tokens.css` is only a backstop, and on its own it makes animations snap.

BR-3 trialled five vendored third-party components here instead. They were
removed in BR-4 — the look was approved but their licence forbids redistributing
source, which a client-owned repo would do. `docs/design-kit.md` has the full
licence position and the reuse pattern for future tenants; `grep -ri aceternity
src/` returning 0 hits is a standing check that no vendored source has crept
back in.

## Batch log

| Batch  | Date       | What                                                                                                                                                                                                                                                               |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BR-2   | 2026-08-18 | Foundation: stripped Zona Dorata, design system + tokens, hand-drawn brand SVGs, header/footer/cart, homepage, `/shop`, `/collections`, `/product/:slug`, `/about`, `/contact`, age gate.                                                                          |
| BR-2.1 | 2026-08-19 | Maison-grade tone pass, no new features: glow halved behind a single `--glow-scale`, wordmark demoted to a logotype, pink restrained to accent-only, rifle replaced by a panther on the banner, `.br-media` cover normalisation, and a much wider vertical rhythm. |
| BR-3   | 2026-08-21 | Design-kit recon, no site change: four Aceternity components vendored into `src/components/kit/`, recoloured to BR tokens with motion cut ~40%, shown on the throwaway `/kit` route. Findings in `docs/design-kit.md`. Rollout deferred to BR-4.                   |
| BR-4   | 2026-08-21 | Homepage rollout: the three approved effects rewritten as our own dependency-free components (`motion` removed), real brand artwork replacing the line art on the hero and banner, marquee cut, `/kit` retired.                                          |
