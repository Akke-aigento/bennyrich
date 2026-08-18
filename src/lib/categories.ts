/**
 * The five BennyRich categories. Names and order are fixed here so the nav and
 * the /collections tiles render instantly; the live list from
 * `GET /categories` (via sellqoProxy) refines counts and any renames at runtime.
 */
export type BrCategory = {
  slug: string;
  name: string;
  /** Copy for the /collections tile. */
  blurb: string;
};

export const CATEGORIES: BrCategory[] = [
  { slug: "apparel", name: "Apparel", blurb: "Oversized cuts, acid washes, neon graphics." },
  { slug: "accessories", name: "Accessories", blurb: "The finishing pieces." },
  { slug: "home", name: "Home", blurb: "Cushions, rugs and runners in soft neon." },
  { slug: "lighting", name: "Lighting", blurb: "Sculptural LED pieces that own the room." },
  { slug: "beverages", name: "Beverages", blurb: "The BennyRich bottle. 18+." },
];

/** Categories whose products sit behind the 18+ interstitial. */
export const AGE_RESTRICTED_CATEGORIES = new Set(["beverages"]);

export function isAgeRestricted(slugs: Array<string | undefined | null>): boolean {
  return slugs.some((s) => !!s && AGE_RESTRICTED_CATEGORIES.has(s));
}
