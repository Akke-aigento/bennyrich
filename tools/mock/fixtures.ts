/**
 * Fixtures for the local SellQo mock.
 *
 * These mirror the REAL storefront-api contract, which was read from
 * `supabase/functions/storefront-api/index.ts` in BR-12 rather than guessed.
 * Three things the BR-11 version got wrong, all now fixed, because each one
 * would have let a feature pass locally for the wrong reason:
 *
 *  1. `get_categories` returns a **bare array**, not `{ categories: [...] }`.
 *  2. Product rows carry **`images: TEXT[]`** — an array of plain URL strings —
 *     and **no `featured_image` field at all**. `productCover()` falls through
 *     `featured_image ?? images[0]`, so anything reading `p.featured_image`
 *     directly would be reading a field that does not exist on live.
 *  3. Products carry **`category: { id, name, slug }`** (singular). That is what
 *     makes the 18+ gate fire on the vodka without a listing round-trip.
 *
 * Two traps are reproduced ON PURPOSE — remove them and the mock stops proving
 * anything:
 *
 *  - image URLs point at a Supabase bucket that **404s**, which is the live
 *    situation (the reconcile is Akke's, see docs/role-audit.md) and is what
 *    makes `<ProductImage>` walk on to `/products/<slug>-<colour>.jpg`;
 *  - variants carry **`attribute_values`** only — no `variant_label`, no
 *    `name`, no `option_values` — so `normalizeCart` still cannot label a cart
 *    line and `src/lib/cart-labels.ts` is still doing real work.
 *
 * Per-category counts match the live catalogue as read off the DB in BR-12
 * (apparel 9, accessories 1, home 6, lighting 4, beverages 1 = 21), so the
 * category tiles are reviewed against a realistic catalogue rather than an
 * invented one. Membership within a category is a reconstruction from the
 * committed seed images; see docs/role-audit.md.
 */

const BUCKET = "https://mock-bucket.invalid/storage/v1/object/public/products";

export type MockProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  in_stock: boolean;
  sku: string;
  category_slug: string;
  /** TEXT[] on live — plain URL strings, never { url } objects. */
  images: string[];
  is_featured: boolean;
  has_variants?: boolean;
  price_range?: { min: number; max: number } | null;
  variants?: Array<{
    id: string;
    price: number;
    sku: string;
    in_stock: boolean;
    attribute_values: Record<string, string>;
  }>;
};

function img(base: string) {
  return `${BUCKET}/${base}.jpg`;
}

function apparel(
  id: string,
  slug: string,
  name: string,
  price: number,
  colours: string[],
  sizes = ["S", "M", "L", "XL"],
  category_slug = "apparel",
): MockProduct {
  const variants = colours.flatMap((colour) =>
    sizes.map((size) => ({
      id: `${id}-${colour}-${size}`.toLowerCase(),
      price,
      sku: `${slug}-${colour}-${size}`.toUpperCase(),
      attribute_values: { Colour: colour, Size: size },
      // One combination out of stock so the disabled-chip path is exercised.
      in_stock: !(colour === colours[0] && size === "XL"),
    })),
  );
  return {
    id,
    name,
    slug,
    description: `${name} in the BennyRich cut. Oversized, heavyweight, neon graphic.`,
    price,
    in_stock: true,
    sku: slug.toUpperCase(),
    category_slug,
    images: colours.map((c) => img(`${slug}-${c.toLowerCase()}`)),
    is_featured: false,
    has_variants: true,
    price_range: { min: price, max: price },
    variants,
  };
}

function simple(
  id: string,
  slug: string,
  name: string,
  price: number,
  category_slug: string,
  imageBase: string | null,
  description: string,
): MockProduct {
  return {
    id,
    name,
    slug,
    description,
    price,
    in_stock: true,
    sku: slug.toUpperCase(),
    category_slug,
    // `null` models a product with NO artwork at all — br-sunglasses is the
    // real one. hasArtwork() must skip these when picking a tile cover.
    images: imageBase ? [img(imageBase)] : [],
    is_featured: false,
    has_variants: false,
    price_range: null,
  };
}

export const PRODUCTS: MockProduct[] = [
  // --- apparel (9 live) ---
  apparel("p-shh-tee", "shh-tee", "SHH Tee", 69.99, ["Blue"]),
  apparel("p-panther-tee", "panther-tee", "Panther Tee", 69.99, ["Blue", "Pink"]),
  apparel("p-f8-tee", "f8-tee", "F8 Tee", 69.99, ["Blue", "Pink"]),
  apparel("p-distressed-tee", "distressed-logo-tee", "Distressed Logo Tee", 79.99, [
    "Blue",
    "Pink",
  ]),
  apparel("p-bust-tee", "bust-tee", "Bust Tee", 69.99, ["Blue"]),
  apparel("p-cherub-tee", "cherub-tee", "Cherub Tee", 69.99, ["Blue"]),
  apparel("p-countach-hoodie", "countach-hoodie", "Countach Hoodie", 149.99, ["Blue", "Pink"]),
  apparel("p-monogram-puffer", "monogram-puffer", "Monogram Puffer", 199.99, ["Pink"]),
  apparel("p-br-cap", "br-cap", "BR Cap", 49.99, ["Blue", "Pink"], ["One size"]),

  // --- accessories (1 live) ---
  simple(
    "p-golden-ticket-print",
    "golden-ticket-print",
    "Golden Ticket Print",
    89.99,
    "accessories",
    "golden-ticket-print",
    "The Golden Ticket, framed.",
  ),

  // --- home (6 live) ---
  simple(
    "p-cushion-rifle",
    "cushion-rifle",
    "Rifle Cushion",
    59.99,
    "home",
    "cushion-rifle-blue",
    "Neon line work on a heavyweight weave.",
  ),
  simple(
    "p-cushion-skyline",
    "cushion-skyline",
    "Skyline Cushion",
    59.99,
    "home",
    "cushion-skyline-pink",
    "Neon line work on a heavyweight weave.",
  ),
  simple(
    "p-cushion-vault",
    "cushion-vault",
    "Vault Cushion",
    59.99,
    "home",
    "cushion-vault-blue",
    "Neon line work on a heavyweight weave.",
  ),
  simple(
    "p-rug-allover",
    "rug-allover",
    "All-over Rug",
    249.99,
    "home",
    "rug-allover-pink",
    "Monogram all-over, tufted.",
  ),
  simple(
    "p-rug-monogram-frame",
    "rug-monogram-frame",
    "Monogram Frame Rug",
    249.99,
    "home",
    "rug-monogram-frame-pink",
    "Monogram framed, tufted.",
  ),
  simple(
    "p-runner-champagne",
    "runner-champagne",
    "Champagne Runner",
    129.99,
    "home",
    "runner-champagne-pink",
    "A runner for the table that matters.",
  ),

  // --- lighting (4 live) ---
  simple(
    "p-led-lamp-rifle",
    "led-lamp-rifle",
    "Rifle LED Lamp",
    189.99,
    "lighting",
    "led-lamp-rifle",
    "Sculptural LED that owns the room.",
  ),
  simple(
    "p-led-lamp-rolls-blue",
    "led-lamp-rolls",
    "Rolls LED Lamp",
    189.99,
    "lighting",
    "led-lamp-rolls-blue",
    "Sculptural LED that owns the room.",
  ),
  simple(
    "p-led-lamp-rolls-pink",
    "led-lamp-rolls-pink",
    "Rolls LED Lamp — Pink",
    189.99,
    "lighting",
    "led-lamp-rolls-pink",
    "Sculptural LED that owns the room.",
  ),
  // No committed artwork — the hasArtwork() skip has to hold.
  simple(
    "p-br-sunglasses",
    "br-sunglasses",
    "BR Sunglasses",
    119.99,
    "lighting",
    null,
    "Neon-etched frames.",
  ),

  // --- beverages (1 live) ---
  {
    id: "p-vodka",
    name: "Benny Rich Vodka 700ml",
    slug: "br-vodka-700ml",
    description: "Benny Rich Vodka, 700 ml. Belgian by origin.",
    price: 69.99,
    in_stock: true,
    sku: "BR-VODKA-700ML",
    category_slug: "beverages",
    images: [img("vodka-blue"), img("vodka-pink")],
    is_featured: false,
    has_variants: false,
    price_range: null,
  },
];

/**
 * Live has `image_url = NULL` on all five categories, so every tile resolves
 * through the product fallback in production. One is set here anyway — to a
 * URL that 404s — so the precedence branch is exercised rather than dead code,
 * and so the fallback is proved to still fire underneath it.
 */
const CATEGORY_IMAGE_URL: Record<string, string | null> = {
  apparel: `${BUCKET}/../categories/apparel.jpg`,
  accessories: null,
  home: null,
  lighting: null,
  beverages: null,
};

export const CATEGORIES = [
  { id: "c-apparel", name: "Apparel", slug: "apparel" },
  { id: "c-accessories", name: "Accessories", slug: "accessories" },
  { id: "c-home", name: "Home", slug: "home" },
  { id: "c-lighting", name: "Lighting", slug: "lighting" },
  { id: "c-beverages", name: "Beverages", slug: "beverages" },
].map((c) => ({
  ...c,
  description: null,
  image_url: CATEGORY_IMAGE_URL[c.slug] ?? null,
  parent_id: null,
  product_count: PRODUCTS.filter((p) => p.category_slug === c.slug).length,
}));

/** The `category: {id,name,slug}` object live attaches to every product row. */
export function categoryOf(slug: string) {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return c ? { id: c.id, name: c.name, slug: c.slug } : null;
}
