/**
 * Local product-image fallback.
 *
 * The SellQo rows point at Supabase bucket URLs that are still being
 * reconciled (owned by Akke — see docs/role-audit.md). Until that lands, any
 * API image URL that fails to load falls back to the copy committed under
 * `public/products/`, named `<slug>-<colour>.jpg`.
 *
 * Two seed filenames do not match their product slug, so they are aliased
 * explicitly rather than derived.
 */
const SLUG_ALIASES: Record<string, string> = {
  "distressed-logo-tee": "distressed-tee",
  "br-vodka-700ml": "vodka",
};

const COLOUR_WORDS = ["blue", "pink", "rose", "black", "white"];

function baseFor(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}

/** Pull a colour word out of a variant label like "Blue / XL". */
export function colourFromLabel(label?: string | null): string | null {
  if (!label) return null;
  const lower = label.toLowerCase();
  return COLOUR_WORDS.find((c) => lower.includes(c)) ?? null;
}

/**
 * Local candidates for a product, most specific first. Consumers walk this
 * list on each image error until one loads.
 */
export function localImageCandidates(slug: string | undefined, colour?: string | null): string[] {
  if (!slug) return [];
  const base = baseFor(slug);
  const named = colour ? [`/products/${base}-${colour.toLowerCase()}.jpg`] : [];
  return [
    ...named,
    `/products/${base}-blue.jpg`,
    `/products/${base}-pink.jpg`,
    `/products/${base}.jpg`,
  ].filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * Full source list for a product image: the API URL first (when there is one),
 * then the local fallbacks.
 */
export function imageSources(
  apiUrl: string | null | undefined,
  slug: string | undefined,
  colour?: string | null,
): string[] {
  const local = localImageCandidates(slug, colour);
  return apiUrl ? [apiUrl, ...local] : local;
}
