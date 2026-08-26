import { Link } from "@tanstack/react-router";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { SpotlightCard } from "@/components/kit/SpotlightCard";
import { pickSpread } from "@/lib/featured";
import { useCategoryProducts } from "@/lib/home-data";

/** How many the featured grid above this one has already shown. */
const ALREADY_SHOWN = 4;
const COUNT = 4;
/** Deep enough that the filters below still leave COUNT to show. */
const POOL = 16;

/**
 * Categories that already have a section of their own on this page.
 *
 * Beverages is one product — the bottle — and VodkaSpotlight sits directly
 * below this row. Without this, the vodka renders as a card and then again,
 * full-width, two hundred pixels later. It is also the one thing on the site
 * that cannot be bought yet, so a "Coming soon" card in a row headed "Shop the
 * range" would be the wrong promise twice over.
 */
const HAS_OWN_SECTION = new Set(["beverages"]);

/**
 * A second product row, after the featured grid.
 *
 * It is deliberately NOT "New arrivals". Every product in this catalogue was
 * bulk-imported on 18–19 August, so nothing here is newer than anything else
 * and the label would be a lie inside a week.
 *
 * Selection reuses `pickSpread` — the same resolver the featured grid uses —
 * and then subtracts, rather than slicing blind:
 *
 *   1. take a deep pool, spread across categories as usual;
 *   2. drop anything the featured grid is already showing, computed by asking
 *      pickSpread for the same four it asks for;
 *   3. drop categories that have their own section;
 *   4. take the first four of what is left.
 *
 * Subtracting an explicitly-computed set is what makes the two rows disjoint,
 * so it stays true if the catalogue changes shape — whereas `.slice(4)` would
 * only hold while the featured four happen to be the pool's first four.
 * (They are: pickSpread is prefix-stable, asserted across the live catalogue
 * and five degenerate shapes. This does not depend on it.)
 *
 * Shows what it has if the catalogue is thin, and renders nothing at all rather
 * than an empty heading if there is no second helping.
 */
export function ShopTheRange() {
  const { groups, isLoading, error } = useCategoryProducts();

  const featuredIds = new Set(pickSpread(groups, ALREADY_SHOWN).map((p) => p.id));
  const ownSectionIds = new Set(
    groups.filter((g) => HAS_OWN_SECTION.has(g.slug)).flatMap((g) => g.products.map((p) => p.id)),
  );
  const rest = pickSpread(groups, POOL)
    .filter((p) => !featuredIds.has(p.id) && !ownSectionIds.has(p.id))
    .slice(0, COUNT);

  // No heading over an empty grid, and nothing at all once we know there is
  // nothing to show.
  if (error || (!isLoading && rest.length === 0)) return null;

  return (
    <section className="br-shell br-section-t">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="br-section-label neon-text-blue-sm">Shop the range</h2>
        <Link
          to="/shop"
          className="br-section-label transition-opacity duration-200 hover:opacity-70"
          style={{ color: "var(--br-blue-text)" }}
        >
          All products <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Same rhythm as the featured grid: the p-3 is what the cursor glow
          breathes into, so the gaps are reduced by exactly that much. */}
      <div className="mt-9 grid grid-cols-2 gap-x-0 gap-y-6 md:grid-cols-4 md:gap-2">
        {isLoading
          ? Array.from({ length: COUNT }).map((_, i) => (
              <div key={i} className="p-3">
                <ProductCardSkeleton />
              </div>
            ))
          : rest.map((p) => (
              <SpotlightCard key={p.id} className="p-3">
                <ProductCard product={p} />
              </SpotlightCard>
            ))}
      </div>
    </section>
  );
}
