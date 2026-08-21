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

/**
 * Products that are shown but cannot be bought yet.
 *
 * The vodka is awaiting an excise (accijns) decision, so it stays visible in
 * the shop and on its own page but the add button is replaced by a disabled
 * "Coming soon". Deliberately keyed by slug and kept independent of any
 * admin flag, so it holds whatever the tenant data says.
 *
 * TO ENABLE PURCHASE: delete the slug from this set. Nothing else to change.
 */
export const NOT_PURCHASABLE = new Set(["br-vodka-700ml"]);

/** Copy shown next to a disabled add button. */
export const NOT_PURCHASABLE_NOTE = "Not yet available for sale — excise clearance pending.";

export function isPurchasable(slug: string | undefined | null): boolean {
  return !slug || !NOT_PURCHASABLE.has(slug);
}

export function isAgeRestricted(slugs: Array<string | undefined | null>): boolean {
  return slugs.some((s) => !!s && AGE_RESTRICTED_CATEGORIES.has(s));
}
