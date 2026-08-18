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

Black canvas everywhere. Neon signage on top of it. Tokens: `src/styles/tokens.css`.

| Token             | Value     | Role                                          |
| ----------------- | --------- | --------------------------------------------- |
| `--br-black`      | `#050505` | page background                               |
| `--br-ink`        | `#0B0B0D` | surfaces: cards, image wells, inputs          |
| `--br-line`       | `#1C1C22` | hairlines                                     |
| `--br-white`      | `#F4F4F6` | primary text (18.6:1 on black)                |
| `--br-mute`       | `#8A8A94` | secondary text (5.96:1 on black — AA passes)  |
| `--br-blue`       | `#1E5BFF` | default UI accent                             |
| `--br-blue-core`  | `#0F55C9` | inner core of the blue glow                   |
| `--br-pink`       | `#FF2D8A` | emphasis, sale/attention, pink-variant pieces |
| `--br-pink-core`  | `#C8287C` | inner core of the pink glow                   |
| `--br-rose`       | `#F06CA6` | soft pink, home-decor accents                 |

### One accent per component

A component picks **one** neon colour and stays with it. Blue is the default;
pink is reserved for emphasis words (the mock's "LUXURIOUS." is pink),
sale/attention states, and pink-variant products. **Never gradient blue → pink
on a single element.**

The one deliberate exception is the "Built different / Made to stand out"
banner on the homepage, where the mock itself pairs a blue line with a pink
line inside a pink frame. Each *element* still carries a single accent.

### Typography

- **Bodoni Moda** 500/600 — wordmark, headings, prices. Uppercase; tracking
  `.06em` on headings, `.18em` on the wordmark.
- **Inter** 400/500 — body, nav, labels. Nav is uppercase 12px, tracking `.22em`.
- The tagline "TIMELESS. BOLD. LUXURIOUS." is always Inter uppercase,
  tracking `.3em`.

Both are loaded from Google Fonts (both OFL) in `__root.tsx`.

### Utilities

Defined with Tailwind v4's `@utility` (not a raw `@layer utilities` block) so
they compose with variants like `group-hover:`:

`neon-text-blue|-pink`, `neon-stroke-blue|-pink`, `neon-line-blue|-pink`,
`neon-glow-blue|-pink` (SVG line art), `neon-btn` (+ `neon-btn-pink`),
`br-display`, `br-nav`, `br-label`, `br-tagline`, `br-price`, `br-shell`.

Buttons are **ghost only** — transparent ground, 1px neon border. The mock
never uses a filled button.

> When a hover utility must beat a base border colour, set the base colour with
> a class (`border-br-line`), not an inline `style` — inline styles win over
> the hover utility and the frame silently stops lighting up.

### Motion

Only opacity/glow transitions, 200ms. Hover lift never exceeds 2px. Radius maxes
out at 2px (shadcn's `rounded-lg` defaults are overridden in `styles.css`).
`prefers-reduced-motion` disables transitions and glow pulses.

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

The raw seed bundle (`seed/`) is gitignored; only `public/products/` and
`docs/brand/` are tracked.

## Age gate

Products in the `beverages` category show an 18+ interstitial before the
product page renders, once per browser session (`sessionStorage`, key
`br_age_verified`). See `src/components/site/AgeGate.tsx` and
`AGE_RESTRICTED_CATEGORIES` in `src/lib/categories.ts`.

## Batch log

| Batch | Date       | What                                                                                                                    |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| BR-2  | 2026-08-18 | Foundation: stripped Zona Dorata, design system + tokens, hand-drawn brand SVGs, header/footer/cart, homepage, `/shop`, `/collections`, `/product/:slug`, `/about`, `/contact`, age gate. |
