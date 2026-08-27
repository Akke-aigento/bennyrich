import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical, HERO_CATEGORY_NAV, HOME_V2, SHOW_RIFLE_BANNER } from "@/lib/site";
import { useQueries } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Spotlight } from "@/components/kit/Spotlight";
import { SpotlightCard } from "@/components/kit/SpotlightCard";
import { VodkaSpotlight } from "@/components/site/VodkaSpotlight";
import { CategoryTiles } from "@/components/site/CategoryTiles";
import { BrandStatement } from "@/components/site/BrandStatement";
import { TextReveal } from "@/components/kit/TextReveal";
import { CATEGORIES } from "@/lib/categories";
import { pickSpread, type CategoryGroup } from "@/lib/featured";
import { sellqoFetch, type SellqoProduct } from "@/lib/sellqo";
import type { ProductsResponse } from "@/lib/use-sellqo";

/**
 * The hero figure is the LCP element. It carries `fetchPriority="high"`, from
 * which React 19 hoists its own <link rel="preload" as="image" fetchpriority="high">
 * into the head — verified in the SSR output. An explicit preload in head()
 * here only duplicated it at a *lower* priority, so it was removed.
 */
const HERO_FIGURE = "/hero/shh-kid-figure.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BennyRich — Timeless. Bold. Luxurious." },
      {
        name: "description",
        content:
          "BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy.",
      },
    ],
    links: [canonical("/")],
  }),
  component: Index,
});

/**
 * `cta` defaults to the original "Shop now" button, and that default is
 * LOAD-BEARING: HomeV1 calls `<Hero />`, so the HOME_V2 escape hatch still
 * renders exactly what the client approved. Never move it, and never refactor
 * the JSX around it. See src/lib/site.ts and docs/role-audit.md, BR-14.
 */
function Hero({ cta }: { cta?: ReactNode }) {
  return (
    // Full-bleed ground so the ambient light spans the viewport, with the
    // content held inside the shell on top of it.
    <section className="relative overflow-hidden">
      <Spotlight />

      <div className="br-shell relative z-10 grid items-center gap-14 py-20 md:min-h-[86vh] md:grid-cols-2 md:gap-12 md:py-0">
        <div>
          <h1
            className="br-display"
            style={{
              fontSize: "clamp(36px, 6vw, 76px)",
              letterSpacing: "0.1em",
              lineHeight: 1.14,
            }}
          >
            <TextReveal>
              <span className="neon-hero-white block">Timeless.</span>
              <span className="neon-hero-blue block">Bold.</span>
              <span className="neon-hero-pink block">Luxurious.</span>
            </TextReveal>
          </h1>
          <p
            className="mt-10 max-w-[34ch] text-[15px]"
            style={{ color: "var(--br-white)", lineHeight: 1.8 }}
          >
            BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and
            legacy.
          </p>
          {cta ?? (
            <Link to="/shop" className="neon-btn mt-11">
              Shop now <span aria-hidden>→</span>
            </Link>
          )}
        </div>

        <div className="order-first md:order-none">
          {/* The artwork carries its own glow — no neon filter on top of it. */}
          <img
            src={HERO_FIGURE}
            alt="The BennyRich kid in a BENNYRICH bucket hat, finger held to his lips"
            width={787}
            height={872}
            loading="eager"
            fetchPriority="high"
            className="mx-auto h-[58vw] w-auto object-contain md:mr-0 md:ml-auto md:h-[72vh]"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * The pill shape, shared by all six links.
 *
 * BR-14 gave these the /shop filter chip's resting look — `--br-line` hairline,
 * `--br-mute` label, blue only on hover. BR-14b lit them at rest at Sander's
 * request: as the hero's only call to action the quiet chip read too weak where
 * a blue "Shop now" button used to be.
 *
 * So the REST state is now neon-btn's: a `--br-blue` border with the house halo
 * and a `--br-blue-text` label. That is deliberate — the brief was "read as lit,
 * like the old button", and the old button was exactly this.
 *
 * Three things that must not drift:
 *
 *   1. the border is set by CLASS (`neon-line-blue`), never an inline style — an
 *      inline colour outranks the hover rules and the pill stops reacting;
 *   2. the label is --br-blue-text (5.50:1), never --br-blue, which is 3.88:1 at
 *      11px and fails AA. This is the same call neon-btn makes;
 *   3. rest is lit, so HOVER has to move somewhere else or there is no feedback
 *      at all. It takes neon-btn's 8% ground wash and brightens the label to
 *      --br-white. Colour and background only, 200ms, nothing pulses.
 */
const HERO_PILL =
  "br-label neon-line-blue border px-4 py-2.5 text-[var(--br-blue-text)] " +
  "transition-[color,background-color,border-color,box-shadow] duration-200 " +
  "hover:bg-[color-mix(in_srgb,var(--br-blue)_8%,transparent)] hover:text-[var(--br-white)]";

/**
 * Category navigation where the single "Shop now" button used to be. BR-14, at
 * Sander's request, behind HERO_CATEGORY_NAV.
 *
 * "All" leads, because removing the button removed the hero's only route to the
 * unfiltered shop; the header dropdown and the /shop chips both lead the same
 * way. Six pills overflow the ~552px hero column at 1280 and wrap 5+1 — that is
 * the accepted cost of keeping "All", NOT a reason to tighten the metrics away
 * from the chip they are copied from.
 *
 * Static CATEGORIES names, like Header's nav. The tiles and the /shop chips take
 * live renames from GET /categories; a nav does not need to, and keeping the
 * query out of the hero keeps post-hydration text changes out of the LCP region.
 *
 * Links, not buttons — these navigate, so they stay right- and middle-clickable.
 * No aria-current: none of them is ever the current page. Blue is the one accent
 * and it lives on the border; nothing pulses.
 */
function HeroCategoryNav() {
  return (
    <nav aria-label="Shop by category" className="mt-11 flex flex-wrap gap-2.5">
      <Link to="/shop" className={HERO_PILL} style={{ borderRadius: "var(--radius)" }}>
        All
      </Link>
      {CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          to="/shop"
          search={{ category: category.slug }}
          className={HERO_PILL}
          style={{ borderRadius: "var(--radius)" }}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

function FeaturedCollection() {
  /**
   * One query per category rather than one for everything.
   *
   * `SellqoProduct` carries no category field, so a single /products call
   * cannot tell us what anything belongs to — and without that, "featured"
   * degrades to "whatever sorted first", which is how three LED lamps ended up
   * filling the grid. Asking per category makes membership true by
   * construction. Same pattern /collections already uses; React Query caches
   * these for 60s and the two pages share them.
   */
  const results = useQueries({
    queries: CATEGORIES.map((c) => ({
      queryKey: ["sellqo", "products", { categorySlug: c.slug, per_page: 20 }],
      queryFn: () =>
        sellqoFetch<ProductsResponse>("/products", {
          query: { category_slug: c.slug, per_page: 20 },
        }),
      staleTime: 60_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error ?? null;
  const groups: CategoryGroup[] = CATEGORIES.map((c, i) => ({
    slug: c.slug,
    products: (results[i]?.data?.products ?? []) as SellqoProduct[],
  }));
  const featured = pickSpread(groups, 4);

  return (
    <section className="br-shell br-section">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="br-section-label neon-text-blue-sm">Featured Collection</h2>
        <Link
          to="/shop"
          className="br-section-label transition-opacity duration-200 hover:opacity-70"
          style={{ color: "var(--br-pink)" }}
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      {/* The p-3 on each card is what the cursor glow breathes into, so the
          grid gaps are reduced by exactly that much to keep BR-2.1's rhythm:
          0 + 12 + 12 = the old 24px, 24 + 12 + 12 = the old 48px, and
          8 + 12 + 12 = the old 32px at md. */}
      <div className="mt-9 grid grid-cols-2 gap-x-0 gap-y-6 md:grid-cols-4 md:gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3">
              <ProductCardSkeleton />
            </div>
          ))
        ) : error ? (
          <p className="col-span-full py-10 text-[13px]" style={{ color: "var(--br-mute)" }}>
            {(error as Error).message || "Unable to load products right now."}
          </p>
        ) : featured.length === 0 ? (
          <p className="col-span-full py-10 text-[13px]" style={{ color: "var(--br-mute)" }}>
            No pieces available yet.
          </p>
        ) : (
          featured.map((p) => (
            <SpotlightCard key={p.id} className="p-3">
              <ProductCard product={p} />
            </SpotlightCard>
          ))
        )}
      </div>
    </section>
  );
}

function BuiltDifferentBanner() {
  return (
    <section className="br-shell br-section-b">
      {/* No neon frame. A hairline and a lot of black do the work the pink
          border used to do far too loudly. */}
      <div
        className="quiet-frame grid items-center gap-12 border px-8 py-16 md:grid-cols-[1fr_minmax(0,54%)] md:px-20 md:py-24"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div>
          <h2
            className="br-display"
            style={{
              fontSize: "clamp(20px, 2.7vw, 29px)",
              letterSpacing: "0.09em",
              lineHeight: 1.45,
            }}
          >
            <span className="neon-text-blue block">Built different.</span>
            <span className="neon-text-pink block">Made to stand out.</span>
          </h2>
          <Link to="/collections" className="neon-btn mt-10">
            Discover more <span aria-hidden>→</span>
          </Link>
        </div>
        {/* No radial mask. Every previous banner image was cut from a photo and
            carried a hard rectangular edge the mask had to dissolve; this one is
            a genuinely transparent PNG — 51% of it is fully clear and all four
            corners are alpha 0 — so there is no edge to hide, and masking it
            would only eat the barrel and stock.

            The blue drop-shadow stays: it is the house glow, and it now falls on
            the artwork's own silhouette rather than on a rectangle.

            Vertical centring comes from the grid's `items-center`; the column
            stays at 54% so the 480px cap is what actually decides the width. */}
        <img
          src="/hero/rifle-blue.png"
          alt="The BennyRich rifle in neon blue line art"
          width={1400}
          height={798}
          loading="lazy"
          className="h-auto w-full max-h-[280px] max-w-[480px] self-center object-contain justify-self-center md:justify-self-end"
          style={{
            filter:
              "brightness(1.1) drop-shadow(0 0 calc(14px * var(--glow-scale)) color-mix(in srgb, var(--br-blue) calc(22% * var(--glow-scale)), transparent))",
          }}
        />
      </div>
    </section>
  );
}

/**
 * The pre-BR-12 homepage, restored by flipping HOME_V2 to false.
 *
 * Every component below is the ORIGINAL, untouched by BR-12. Do not "tidy" any
 * of them — the moment one changes, this stops being what the client last
 * approved and the escape hatch is worth nothing. See src/lib/site.ts.
 */
function HomeV1() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <VodkaSpotlight />
      <BuiltDifferentBanner />
    </>
  );
}

/** The BR-12 homepage. New sections land here and nowhere else. */
function HomeV2() {
  return (
    <>
      <Hero cta={HERO_CATEGORY_NAV ? <HeroCategoryNav /> : undefined} />
      <FeaturedCollection />
      <VodkaSpotlight />
      <CategoryTiles />
      <BrandStatement last={!SHOW_RIFLE_BANNER} />
      {/* V2 ONLY. HomeV1 below renders the banner unconditionally, so the
          HOME_V2 escape hatch still restores what the client approved. Never
          move this test inside BuiltDifferentBanner. */}
      {SHOW_RIFLE_BANNER && <BuiltDifferentBanner />}
    </>
  );
}

function Index() {
  return <SiteLayout>{HOME_V2 ? <HomeV2 /> : <HomeV1 />}</SiteLayout>;
}
