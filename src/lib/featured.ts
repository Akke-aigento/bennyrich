/**
 * Homepage featured selection.
 *
 * The tenant's catalogue has no `is_featured` flags set, so the old
 * "first four products" approach put three LED lamps in a row on the homepage.
 * That reads as a warehouse, not a curation.
 *
 * This picks a spread instead: one piece per category, round-robin, so the
 * grid shows apparel next to lighting next to home next to a bottle. If
 * `is_featured` ever does get set in the admin, those win first and the
 * round-robin only fills what is left.
 *
 * Pure functions — the fetching lives in the route, so this stays trivially
 * checkable and does not care where the products came from.
 */
import { isFeatured } from "./use-sellqo";
import type { SellqoProduct } from "./sellqo";

/** One category's products, in the order the API returned them. */
export type CategoryGroup = { slug: string; products: SellqoProduct[] };

/**
 * Does this product have artwork of its own?
 *
 * Same predicate `collections.tsx` already uses to keep an image-less product
 * (currently `br-sunglasses`) out of a tile. A card with an empty well is worse
 * than a different product in the slot.
 */
export function hasArtwork(p: SellqoProduct): boolean {
  return (p.images?.length ?? 0) > 0 || !!p.featured_image;
}

/**
 * Up to `count` products spread across categories.
 *
 * Order of preference:
 *   1. anything the API flags as featured, in category order
 *   2. round-robin: the first unused product from each category in turn
 *   3. top-up from everything already fetched, if the categories ran dry
 *
 * Products without artwork are skipped in passes 1 and 2, and only used in
 * pass 3 if there is genuinely nothing else to show.
 */
export function pickSpread(groups: CategoryGroup[], count = 4): SellqoProduct[] {
  const chosen: SellqoProduct[] = [];
  const seen = new Set<string>();

  const take = (p: SellqoProduct) => {
    if (chosen.length >= count || seen.has(p.id)) return;
    seen.add(p.id);
    chosen.push(p);
  };

  // 1. Explicitly featured pieces come first, whatever category they sit in.
  for (const g of groups) {
    for (const p of g.products) {
      if (isFeatured(p) && hasArtwork(p)) take(p);
    }
  }

  // 2. Round-robin one per category until we have enough. `depth` walks each
  //    group's list in step, so category order decides the layout, not the
  //    order the API happened to return.
  const deepest = Math.max(0, ...groups.map((g) => g.products.length));
  for (let depth = 0; depth < deepest && chosen.length < count; depth++) {
    for (const g of groups) {
      if (chosen.length >= count) break;
      const p = g.products.filter(hasArtwork)[depth];
      if (p) take(p);
    }
  }

  // 3. Last resort: anything at all, artwork or not, rather than a short grid.
  if (chosen.length < count) {
    for (const g of groups) for (const p of g.products) take(p);
  }

  return chosen;
}
