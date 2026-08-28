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
- **`tools/`** is the dev harness, outside `src/` and shipped to nobody:
  `tools/mock/` is a local SellQo storefront-api on `:8788` (see _Local
  development_ below) and `tools/screens/` is the CDP screenshot capture. Both
  were rebuilt and committed in BR-11 after living in a scratchpad and being
  lost twice.
- Deployed through **Lovable** (project `2abe3881`). Commits pushed to `main`
  sync back into the Lovable editor, so keep `main` in a working state and
  never rewrite pushed history.

There is **no `index.html`** — TanStack Start owns the document. Title, meta,
favicon and font links are in `src/routes/__root.tsx` under `head()`.

## Hard rules

**Do not modify these files.** Read them and reuse them. If a UI need seems to
require changing one, stop and report instead of editing:

- `src/lib/sellqo.ts`
- `src/lib/cart-context.tsx`
- `src/lib/checkout.ts`
- `src/lib/use-sellqo.ts`
- `src/integrations/**`

`src/lib/sellqo.functions.ts` is **extend-additively-only** as of BR-9a: new
API surfaces may be bolted on, but the existing `resolveAction` and the
storefront-api request path must not change behaviour. Verify it by diffing them
semantically, not by eye.

(`src/components/site/CheckoutForm.tsx` was on this list until BR-6. It is
presentation only — `FormField`, `FieldError`, `PrimaryButton`,
`EmptyCartRedirect` and a read-only `useCart` — with no SellQo logic in it, so
it is editable. The checkout _routes_ were never frozen either.)

Also:

- **Never call SellQo directly from the client.** Everything goes through
  `sellqoProxy`.
- **Never recompute prices client-side.** Render exactly what the API returns —
  the cart response is the single source of truth.
- **Categories are categories.** Never dress them up as anything grander — the
  client was explicit about this in BR-12 after the word appeared on
  `/collections`. `grep -rni "worlds\|werelden" src/` stays at 0.
- **No unverifiable claims, anywhere.** No shipping, delivery or returns
  promises; no "secure checkout" or payment badges; no ratings, reviews or
  testimonials; no "new arrivals". Each of those is currently false: the tenant
  has zero active shipping methods, `stripe_charges_enabled = false`, there are
  no reviews, and every product was bulk-imported on the same two days. When
  shipping and Stripe go live, a value strip with **true** numbers becomes a
  short follow-up — see `docs/role-audit.md`, BR-12.
- **English only. EUR. nl-BE formatting** — comma decimals, symbol tight:
  `€69,99`. Use `formatEUR` from `src/lib/format.ts`.
  (`src/lib/sellqo.ts` also exports a `formatEUR`, but it is frozen and formats
  it-IT — `69,99 €`. Do not use it. BR-5 found all three checkout routes
  importing the frozen one and rendering `89,99 €` on the money-facing steps;
  if you add a page that shows a price, check the import.)
- Work on `main`, commit per step.

> **Never nest a fixed overlay inside the header.** `backdrop-filter` with any
> value but `none` makes an element a containing block for its fixed
> descendants, and the header takes `blur(12px)` once the page scrolls past 8px.
> The mobile menu was a `fixed inset-0` child of it and measured 390×72 instead
> of 390×844 — that was BR-11's "transparent menu" bug. It is portalled to
> `document.body` now. The desktop search bar and Shop dropdown are `absolute`
> and deliberately **not** portalled: they want the header as their containing
> block.

## Customer accounts (the second edge function)

Core runs a **second** edge function, `storefront-customer-api`, alongside the
`storefront-api` this app uses for products and carts. Same
`{ action, tenant_id, params }` protocol, same `X-API-Key`, plus an
`x-storefront-token` bearer for authed actions.

`sellqoProxy` reaches it through a branch taken before any storefront-api code
runs. Paths under **`/auth/*`, `/account/*` and `/wishlist/*`** go to the
customer API; everything else is unchanged. The endpoint is derived from the
already-validated `SELLQO_API_URL` by swapping `storefront-api` for
`storefront-customer-api` — there is no second secret.

> Naming trap: the proxy's `/account/*` **paths** are an internal vocabulary for
> that function. They are not the app's `/account/*` **routes**, which merely
> share a prefix.

**The session token never reaches the browser.** login/register responses are
intercepted in the proxy: the token goes into an httpOnly `br_customer_token`
cookie and is stripped from the payload returned to JS. A cookie written by
client JS would be no safer than localStorage — injected script reads both — so
this only works because it is set server-side.

Consequences to keep in mind:

- `useAuth()` starts in **`status: "loading"`** and resolves via `/account/me`.
  Treat `loading` as a real state; reading "no customer yet" as "signed out"
  flashes a login form at signed-in visitors.
- `RequireAuth` is **UX, not security**. The real check is inside the edge
  function.
- `POST /auth/logout` never leaves the proxy — the session _is_ the cookie.

## Cart variant labels

`normalizeCart` in the frozen `sellqo.ts` derives a cart line's variant label
from `variant_label ?? variant.name ?? variant.option_values`. This tenant sends
none of those — its variants carry **`attribute_values`** — so the label comes
back `null` and both the bag and the checkout summary show a product with no
indication of which variant was ordered.

`src/lib/cart-labels.ts` (`useCartVariantLabels`) resolves it in presentation by
matching the line's `variant_id` against the product and building the label with
`optionValuesOf` from `src/lib/variants.ts`. Any line that already has a label is
passed through untouched, so **the moment `normalizeCart` learns to probe
`attribute_values`, this file can be deleted.** Both surfaces read the one
resolver so they cannot drift apart.

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
cannot reach SellQo. The mock is in the repo since BR-11 — run it, then point
the proxy at it:

```
bun tools/mock/server.ts                       # storefront-api on :8788

SELLQO_API_KEY=mock SELLQO_TENANT_ID=mock \
SELLQO_API_URL=http://localhost:8788/functions/v1/storefront-api bun run dev
```

(The proxy only accepts a URL containing `/functions/v1/storefront-api`.)

The fixtures in `tools/mock/fixtures.ts` reproduce two live traps **on purpose**
— take them out and the mock stops proving anything: `featured_image` points at
a bucket URL that 404s, which is what makes `<ProductImage>` walk on to
`/products/<slug>-<colour>.jpg`; and variants carry `attribute_values` only, so
`normalizeCart` still returns `variant_label: null` and `cart-labels.ts` is
still doing real work.

Screenshots come from `bun tools/screens/capture.ts` against that pair. It
carries seven hard-won capture traps in comments; read them before changing it.

## Design system

Black canvas everywhere, with restrained neon on top of it — signage seen from
across a quiet room, not a lit sign in your face. Tokens: `src/styles/tokens.css`.

| Token            | Value     | Role                                                |
| ---------------- | --------- | --------------------------------------------------- |
| `--br-black`     | `#050505` | page background                                     |
| `--br-ink`       | `#0B0B0D` | surfaces: cards, image wells, inputs                |
| `--br-line`      | `#1C1C22` | hairlines                                           |
| `--br-white`     | `#F4F4F6` | primary text (18.6:1 on black)                      |
| `--br-mute`      | `#8A8A94` | secondary text (5.96:1 on black — AA passes)        |
| `--br-blue`      | `#1E5BFF` | default UI accent — borders, glows, large type      |
| `--br-blue-text` | `#4A7DFF` | small blue text (11px). 5.50:1 vs AA-failing 3.88:1 |
| `--br-blue-core` | `#0F55C9` | inner core of the blue glow                         |
| `--br-pink`      | `#FF2D8A` | emphasis, sale/attention, pink-variant pieces       |
| `--br-pink-core` | `#C8287C` | inner core of the pink glow                         |
| `--br-rose`      | `#F06CA6` | soft pink, home-decor accents                       |

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

### Product media

Every product media well carries `br-media-frame`: a 55% blue border and a
6px/35% halo, both riding `--glow-scale`. Product photography comes from the
tenant's admin and its grounds are inconsistent — a lit frame means the well
reads against the black page whatever the photo does, which normalising images
one at a time would not survive. Hover swaps in `neon-line-blue`.

Set the resting border with the class, never an inline style: the `group-hover:`
variant wins on specificity, but an inline colour would beat both.

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
**Nothing pulses** — the neon is steady and no glow is ever animated.

Two sanctioned exceptions to "no movement", and only two:

1. the header picks up a `blur(12px)` frosted ground once the page scrolls past
   8px; and
2. the **splash screen**'s 1000ms fade (BR-11, client decision). While it is up
   it — not the hero figure — is the LCP element.

`prefers-reduced-motion` switches transitions off, and anything with a named
animation must also switch itself off by name rather than rely on the global
duration crush in `tokens.css`.

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

Every cover sits in a `.br-media` well: pure `--br-black` ground,
**`object-fit: cover`, centred, no padding**, plus a 6%-opacity radial vignette.
Source aspect ratios differ, so BR-7 moved off `contain` — under it each product
floated at a different size inside an identical frame and a row read as products
floating in black. Cover gives every tile the same framing, at the cost of
cropping the edges.

**The one exception is `.br-media-contain`**, used on the large product-detail
image and the vodka spotlight, where the whole product has to be visible. Its
rule must stay _after_ the base rule in `tokens.css` — equal specificity, so
source order decides.

> **Never put `padding` back on `.br-media-contain > img`.** It carried
> `padding: 8%` until BR-16, and that was the whole reason the product page
> "looked dark" — percentage padding resolves against the containing block's
> **width on all four sides**, so the content box was 84%×84% before `contain`
> ran and a portrait photo painted onto ~56% of a square well. Nothing was ever
> tinted or dimmed. It is also shared by **two** surfaces (the gallery and
> `VodkaSpotlight`), so a padding here shrinks both at once.

Two consequences to know:

- **10 of the 26 seed images lose ≥19% of their content** to the centre crop —
  the countach hoodie (a front+back shot) loses 32% of its width. These need
  reshooting, not CSS exceptions; there are deliberately no per-product
  `object-position` overrides. The measured list is in `docs/role-audit.md`.
- Cover makes the **white-ground images louder**, not quieter: six of them now
  fill their neon frame with solid white instead of sitting inset in black.

The raw seed bundle (`seed/`) is gitignored; only `public/products/` and
`docs/brand/` are tracked.

## Brand artwork

### The logo (`public/brand/`) — official, and a raster

Since BR-11 the wordmark and monogram are the client's **official neon render**,
not type set in Bodoni Moda. Four transparent PNGs, each carrying its own glow:

| File                               | Pixels  | Used for                                         |
| ---------------------------------- | ------- | ------------------------------------------------ |
| `logo-lockup-blue.png`             | 775×317 | `Wordmark layout="stacked"` — footer, 404, OG    |
| `logo-wordmark-blue.png`           | 775×117 | `Wordmark layout="inline"` — header, mobile menu |
| `logo-wordmark-worldwide-blue.png` | 775×181 | reserve, not wired up                            |
| `logo-monogram-blue.png`           | 157×136 | `Monogram` (ring ≈101px inside the crop)         |

`Wordmark.tsx` and `Monogram.tsx` are thin `<img>` wrappers that keep the old
prop API, so call sites did not change. Rules that come with them:

- **No `logotype-*` or `neon-glow-*` class on the image.** The glow is in the
  raster; a filter on top double-lights it.
- **The logo no longer tracks `--glow-scale`** — same accepted cost as the hero
  and banner art below.
- `size` means the **cap height of BENNY RICH** (ring diameter for the
  monogram), scaled off the crops. Omit `size` and a height class in `className`
  governs instead — the only way to get a responsive height like the footer's
  `h-32 md:h-40`.
- **There is no "New York".** The official lockup says **WORLDWIDE**. `showCity`
  survives as a no-op so old call sites compile; do not resurrect a city line.
- **There is no pink set yet**, so `tone="pink"` still renders the _drawn_ SVG
  monogram — the 18+ gate is its only caller. Producing one is a single run of
  `docs/brand/tools/neon_alpha.py` over `docs/brand/logo-pink.jpg`, after which
  that branch can go.

BR-2.1 deliberately demoted the wordmark to a flat logotype ("a logo has to read
as print at 18px"). **The client overrules that with his official mark.** It is
a recorded decision, not a regression — see `docs/role-audit.md`, BR-11.

### Favicons

Derived from the official monogram on `#050505`, same seven filenames as before,
so `__root.tsx` needs no change. Two things to know: `favicon.svg` is **not a
vector** — it is a ~60KB SVG wrapper around a 192px raster — and
`android-chrome-512.png` is a 5× upscale of a ~100px source, so it is soft. Both
follow from the source being a WhatsApp JPEG; the original vector is an open
question for Sander.

### The hero and banner art

`public/hero/` holds the photographic-scale artwork, transparent PNGs that
likewise carry their own glow and take **no** `neon-glow-*` filter:

- `shh-kid-figure.png` (787×872) — the homepage hero. It is the LCP element
  once the splash is gone, so it carries `fetchPriority="high"`; React 19 hoists
  its own `<link rel="preload" as="image">` from that, and adding one by hand
  only duplicates it at a lower priority.
- `shh-kid-splash.png` (704×900, 201KB) — the splash artwork, **derived** from
  `shh-kid-full.png` by downscaling and pngquant. The 1.2MB original is
  committed and untouched; do not point the splash at it.
- `rifle-blue.png` (1400×798) — the "Built different" banner. It replaced
  `panther-blue.png` at Sander's request. **No radial mask**: unlike every
  earlier banner image this one is genuinely transparent (51% fully clear, all
  four corners alpha 0), so there is no rectangular edge to dissolve and masking
  it would only eat the barrel and stock. Sized `object-contain` and capped at
  `max-w-[480px] / max-h-[280px]`; the column stays `minmax(0,54%)` so the cap
  is what decides the width. **See the ad-safety flag in `docs/role-audit.md`
  before pointing paid social at `/`.**
- `panther-blue.png` (706×624) — the previous banner artwork, still committed
  and unused.
- `shh-kid-full.png` (source for the splash) and `shh-kid-ticket.png` (unused).

Because the glow is baked into the raster, **none of these track
`--glow-scale`.** That is the accepted cost of real art over line art.

### The line art, parked

`shh-kid.svg` and `panther.svg` are plain SVG files inlined via `?raw` in
`LineArt.tsx`, so a single file stays the source of truth while `currentColor`
and the neon glow filter still apply to the strokes. They were the homepage
stand-ins until BR-4 and are **kept but no longer rendered anywhere**.

`rifle.svg` is likewise in the repo and not wired up — it read as a club flyer
when it was the banner in BR-2. Note that the _reason_ recorded here in BR-2.1,
"not ad-safe", no longer reflects what ships: a rifle PNG is on the banner again
as of 2026-08-24, at the client's documented request. The ad-policy exposure is
real and is written up in `docs/role-audit.md`; it was accepted, not overlooked.

To bring any of the three back on a product page, import it the way the panther
used to be imported in `src/routes/index.tsx`.

## Splash screen

`SplashScreen.tsx` shows the shh-kid crest once per browser session
(`sessionStorage`, key `br_splash_shown`), mounted in `SiteLayout` at `z-[100]`
— above the header (`z-40`), cart drawer (`z-50`), cookie banner (`z-[55]`) and
the 18+ gate (`z-[60]`).

Phases `pending → in → hold → out → done`. The fade in starts on the image's own
`load`, floored at 500ms and capped at 1500ms from mount; it holds 2000ms and
fades out over 1000ms. **`pending` renders nothing and every mount starts there**
— `SiteLayout` remounts on every client navigation, so without that gate the
overlay flashes black for a frame on every route change. X and Escape skip it.
`prefers-reduced-motion` skips it entirely, matched by name via `matchMedia`.

## The homepage flags

Three flags in `src/lib/site.ts` gate the homepage. All three are **V2-only** —
`HomeV1` reads none of them.

```
HOME_V2            true  -> Hero, FeaturedCollection, VodkaSpotlight,
                            CategoryTiles, BrandStatement, BuiltDifferentBanner
                   false -> Hero, FeaturedCollection, VodkaSpotlight,
                            BuiltDifferentBanner   (the pre-BR-12 page)

HERO_CATEGORY_NAV  true  -> the hero shows six category pills (All + the five)
                   false -> the hero shows the original "Shop now" button

SHOW_RIFLE_BANNER  true  -> the "Built different" rifle banner renders
                   false -> it does not (the shipped state since BR-14)
```

`HOME_V2` exists because the rebuilt homepage is a **go/no-go on the client's
taste**, not a refactor: rejecting it has to be one line, not five reverts.
`HERO_CATEGORY_NAV` is the same bet on a smaller surface.

> **The `false` arm renders the ORIGINAL components.** `FeaturedCollection`,
> `VodkaSpotlight` and `BuiltDifferentBanner` must stay untouched — the moment
> one is "tidied up", flipping the flag no longer restores what the client last
> approved and the escape hatch is worth nothing. If you need to change one,
> copy it.

> **`Hero` is the one sanctioned exception, and it is deliberate.** BR-14 gave
> it a single optional `cta` prop **whose default is the original "Shop now"
> button**. `HomeV1` calls `<Hero />`, so the false arm renders what it always
> did. A `HeroV2` fork would have duplicated ~50 lines including the LCP
> `<img>`, plus a third copy of the button for `HERO_CATEGORY_NAV === false`.
> **That default is load-bearing: never move it, and never refactor the JSX
> around it.** The reasoning is in `docs/role-audit.md`, BR-14.

> **`SHOW_RIFLE_BANNER` is tested at the `HomeV2` call site, never inside
> `BuiltDifferentBanner`.** The component is rendered by both arms, so an early
> `return null` in it would strip the banner from `HomeV1` too. It is hidden,
> not deleted — the component and `public/hero/rifle-blue.png` both stay. While
> it is `false`, `/` is ad-safe; turning it on reopens the firearm-imagery
> ad-policy exposure carried since BR-2.1. Read `docs/role-audit.md` first.

Accepting the new homepage means deleting the flag and the `HomeV1` branch in
`src/routes/index.tsx`, not leaving both arms to rot.

**Section rhythm is positional, so reordering is never just a reorder.**
`br-section-t` / `-b` pad one side each so adjacent gaps do not double. When
BR-14 moved `CategoryTiles` below `VodkaSpotlight` it had to drop its
`br-section-t` (the neighbour above already pads its bottom), and
`BrandStatement` gained a `last` prop so it closes its own bottom when the
banner is off. `last` is a plain presentation prop — the flag is read at the
call site, never inside the component.

`src/lib/home-data.ts` (`useCategoryProducts`) holds the per-category product
fan-out. `CategoryTiles` is its only caller since BR-12b, and that is fine — the
point is the **query key**, which is deliberately identical to the one
`FeaturedCollection` inlines. That is what makes the tiles and the featured grid
share one React Query cache entry per category, so the homepage makes five
requests rather than ten. `FeaturedCollection` does not import it, for the
reason above.

### Category tiles and category art

`CategoryTiles` resolves a tile cover as `category.image_url` first, then the
first product in that category with artwork. Every BennyRich category currently
has `image_url = NULL`, so today every tile is product-derived — **uploading
category images in the admin is a zero-code upgrade.** A category with no
artwork at all renders its name on a plain ink ground and still links; an empty
image well is worse than no image.

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
besides the header, and it is permitted as _ambient light_, not an animated
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

## Site URL, metadata and the consent gate

`src/lib/site.ts` exports **`SITE_URL`** plus `absoluteUrl`, `canonical` and
`metaDescription`. Canonical links and `og:image` must be absolute — a relative
path silently produces a broken share preview.

> **`SITE_URL` is the single line to change when the real domain lands.** It
> currently points at the Lovable preview host.

Canonicals live **only on routes, never in `__root`**: root and route `links`
are concatenated, not merged, so a canonical at the root emits a second one on
every page and a crawler then honours neither.

`/product/:slug` has a **route loader**, and needs one: `head()` cannot see
`useQuery` data and social scrapers do not run JavaScript, so per-product titles
and images have to be server-rendered. The component's query is seeded from
`loaderData`, so it stays one fetch.

`sitemap.xml` is served from `src/server.ts` — this TanStack Start version has
no server-route factory. Product URLs are currently absent; see
`docs/role-audit.md` for why and what would change.

### Adding analytics or a pixel

Nothing is tracked today. `src/lib/consent.tsx` is the gate; `hasConsent()` is
false for everything optional until the shopper accepts, and the choice lives in
the first-party `br_consent` cookie.

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

A Meta pixel uses the same check with category `marketing`. **Never put a
tracking script in `__root`'s `scripts`** — it would load before the shopper has
answered, defeating the gate.

### Order history is gated on a verified email

`/account/orders` exists since BR-10, and it is gated twice. Core (CUSTAUTH-1)
sends a verification email on register, returns `email_verified` on login and
`get_profile`, and answers `get_orders` / `get_order` with **HTTP 403
`EMAIL_NOT_VERIFIED`** until the address is confirmed. The storefront gates on
`email_verified` up front and treats that 403 as the same gate — `get_orders`
matches by `customer_email`, so an ungated page would hand someone else's guest
orders to anyone who registered with their address.

The trap: the proxy used to clear the session cookie on **any** 401 or 403, so
core's new 403 signed the customer out mid-click. `sellqo.functions.ts` now
checks for `EMAIL_NOT_VERIFIED` **before** that branch. Keep that check first if
you ever touch the error handling there.

Never read `email_verified === undefined` as unverified — an older core simply
omits the field, and the banner would then nag about an email nobody sent.

## Batch log

| Batch  | Date       | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-2   | 2026-08-18 | Foundation: stripped Zona Dorata, design system + tokens, hand-drawn brand SVGs, header/footer/cart, homepage, `/shop`, `/collections`, `/product/:slug`, `/about`, `/contact`, age gate.                                                                                                                                                                                                                                                                                                                                                                                           |
| BR-2.1 | 2026-08-19 | Maison-grade tone pass, no new features: glow halved behind a single `--glow-scale`, wordmark demoted to a logotype, pink restrained to accent-only, rifle replaced by a panther on the banner, `.br-media` cover normalisation, and a much wider vertical rhythm.                                                                                                                                                                                                                                                                                                                  |
| BR-3   | 2026-08-21 | Design-kit recon, no site change: four Aceternity components vendored into `src/components/kit/`, recoloured to BR tokens with motion cut ~40%, shown on the throwaway `/kit` route. Findings in `docs/design-kit.md`. Rollout deferred to BR-4.                                                                                                                                                                                                                                                                                                                                    |
| BR-4   | 2026-08-21 | Homepage rollout: the three approved effects rewritten as our own dependency-free components (`motion` removed), real brand artwork replacing the line art on the hero and banner, marquee cut, `/kit` retired.                                                                                                                                                                                                                                                                                                                                                                     |
| BR-5   | 2026-08-21 | The shop that sells: `br-media-frame` on all product media, featured grid spread across categories, two-line product names, variant options derived from the variants (apparel was unbuyable without it), out-of-stock combinations disabled, vodka held behind `NOT_PURCHASABLE`, checkout switched off the it-IT formatter.                                                                                                                                                                                                                                                       |
| BR-6   | 2026-08-24 | Checkout polish: variant labels resolved in presentation (the frozen normaliser cannot read `attribute_values`), one image treatment everywhere (`.br-media` contain on both thumbnails, no cropping), `/perfumes` and the white-slab checkout button removed, `CheckoutForm.tsx` unfrozen.                                                                                                                                                                                                                                                                                         |
| BR-7   | 2026-08-24 | Image fit: product media moved from `object-fit: contain` to centre `cover` so a row reads as a uniform grid instead of products floating in black. The large product-detail image keeps `contain` via `.br-media-contain`. 10 of 26 seed images crop badly and are flagged for reshoot.                                                                                                                                                                                                                                                                                            |
| BR-8   | 2026-08-24 | Launch essentials: full favicon set + webmanifest, per-page metadata with per-product OG (route loader, SSR-verified), robots + sitemap, Organization/Product JSON-LD, consent gate with no analytics loaded, shipping total now updates on selection, `--br-blue-text` for AA, on-brand 404 and both error pages, prettier sweep.                                                                                                                                                                                                                                                  |
| BR-9a  | 2026-08-24 | Accounts foundation: proxy extended additively to the `storefront-customer-api`, auth context with an httpOnly session cookie the browser cannot read, sign-in / register / forgot / reset pages, guarded `/account` dashboard, header and mobile menu. Orders, addresses, wishlist and checkout prefill are BR-9b.                                                                                                                                                                                                                                                                 |
| BR-9b  | 2026-08-24 | Account area: addresses CRUD, wishlist with the heart on cards and the product page, checkout prefill for signed-in shoppers. Order history and profile editing deliberately not built — `get_profile` does not expose `email_verified`, so order history cannot be gated safely.                                                                                                                                                                                                                                                                                                   |
| BR-10  | 2026-08-24 | Accounts complete: `url_base` injected server-side so verification and reset mails link to BennyRich, `/account/verify`, order history and order detail gated on `email_verified`, a non-blocking verification banner, and `/account/profile` (details + password). The proxy no longer signs you out on core's 403.                                                                                                                                                                                                                                                                |
| BR-11  | 2026-08-26 | Client revision round: the official neon logo everywhere (BR-2.1's flat logotype overruled by the client, "New York" dropped for WORLDWIDE), the mobile menu portalled out of the header to fix a `backdrop-filter` containing-block bug, a Shop accordion and a clickable desktop dropdown, the splash screen, the "Born in Belgium" vodka section, a regenerated OG image and favicons, and the mock + capture harness finally committed under `tools/`.                                                                                                                          |
| BR-12  | 2026-08-26 | Revision round 2. To `main`: TikTok removed sitewide, `info@` confirmed as the only address, and the vodka's 18+ gate proved to already fire (no second modal built). Behind `HOME_V2` on `br-12-home`: category tiles, a second product row that cannot repeat the first, and a claim-free brand statement. The mock was corrected against the real edge-function contract. Merged to `main`.                                                                                                                                                                                      |
| BR-12b | 2026-08-26 | The "Shop the range" second product row removed at client review — it read as a near-duplicate of the Featured Collection grid above it, and the category band already covers discovery. One component deleted, nothing orphaned, escape hatch untouched. Merged to `main`.                                                                                                                                                                                                                                                                                                         |
| BR-14  | 2026-08-27 | Revision round 3, all client-requested. The hero's "Shop now" button becomes six category pills behind `HERO_CATEGORY_NAV` (`Hero` takes a `cta` prop defaulting to the button, so the V1 arm is unchanged); the category band moves below the vodka; the rifle banner is hidden behind `SHOW_RIFLE_BANNER`, closing the ad-safety exposure open since BR-2.1. Fixed a doubled section gap that had shipped since BR-12, and a `"FIVE WORLDS"` comment that made CLAUDE.md's own standing grep return 1.                                                                            |
| BR-14b | 2026-08-27 | The hero pills lit at rest at client review — the muted `/shop` chip read too quiet as the hero's only CTA, so rest is now `neon-btn`'s blue border + `--br-blue-text` label and hover moved to the 8% ground wash. Chip parity given up on purpose; the AA rule on the 11px blue label holds. One constant in `index.tsx`.                                                                                                                                                                                                                                                         |
| BR-16  | 2026-08-28 | Two client fixes. The product gallery "rendering dark" was `padding: 8%` on `.br-media-contain > img` shrinking the photo to ~56% of a square well — geometry, not a tint; removing it is a flat ×1.417 for every image and lifts the vodka spotlight too. `/shop` gained per-category header copy (`CATEGORY_HEADERS`), UX-only — per-category `head()` meta was declined because `/shop` canonicalises to itself. Found not fixed: the `<ProductImage>` fallback walk never advances on a directly-loaded `/product/:slug` (loader ⇒ the image error precedes React's `onError`). |
