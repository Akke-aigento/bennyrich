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
  `/our-story`, `/selfcare` (and `/perfumes` — see *Deviations*)
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
  The mock used for local screenshots deliberately serves the *real* (currently
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
