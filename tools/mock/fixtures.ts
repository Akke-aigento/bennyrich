/**
 * Fixtures for the local SellQo mock. Shapes mirror what the tenant actually
 * sends, including the two traps the storefront works around:
 *
 *  - `featured_image` points at a Supabase **bucket URL that 404s**. That is the
 *    live situation (the reconcile is Akke's, see docs/role-audit.md), and it is
 *    what makes `<ProductImage>` walk on to the committed
 *    `/products/<slug>-<colour>.jpg`. A fixture with no `featured_image` would
 *    skip the walk entirely and prove nothing.
 *  - variants carry **`attribute_values`**, not `option_values` / `variant_label`
 *    / `name`, which is why `normalizeCart` cannot label a cart line and
 *    `src/lib/cart-labels.ts` exists.
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
  featured_image: { url: string };
  images: Array<{ url: string }>;
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
  return { url: `${BUCKET}/${base}.jpg` };
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
      // Deliberately `attribute_values`: this tenant sends nothing else.
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
    featured_image: img(`${slug}-${colours[0].toLowerCase()}`),
    images: colours.map((c) => img(`${slug}-${c.toLowerCase()}`)),
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
  imageBase: string,
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
    featured_image: img(imageBase),
    images: [img(imageBase)],
    has_variants: false,
    price_range: null,
  };
}

export const PRODUCTS: MockProduct[] = [
  // --- apparel ---
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

  // --- accessories ---
  apparel("p-br-cap", "br-cap", "BR Cap", 49.99, ["Blue", "Pink"], ["One size"], "accessories"),
  simple(
    "p-br-sunglasses",
    "br-sunglasses",
    "BR Sunglasses",
    119.99,
    "accessories",
    "br-sunglasses",
    "Neon-etched frames. The finishing piece.",
  ),
  simple(
    "p-golden-ticket-print",
    "golden-ticket-print",
    "Golden Ticket Print",
    89.99,
    "accessories",
    "golden-ticket-print",
    "The Golden Ticket, framed.",
  ),

  // --- home ---
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

  // --- lighting ---
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
    "p-led-lamp-rolls",
    "led-lamp-rolls",
    "Rolls LED Lamp",
    189.99,
    "lighting",
    "led-lamp-rolls-blue",
    "Sculptural LED that owns the room.",
  ),

  // --- beverages ---
  {
    id: "p-vodka",
    name: "Benny Rich Vodka 700ml",
    slug: "br-vodka-700ml",
    description: "Benny Rich Vodka, 700 ml. Belgian by origin.",
    price: 69.99,
    in_stock: true,
    sku: "BR-VODKA-700ML",
    category_slug: "beverages",
    // The live row HAS a featured_image — a bucket URL that currently 404s.
    // `/products/vodka-blue.jpg` is reached by ProductImage walking past it.
    featured_image: img("vodka-blue"),
    images: [img("vodka-blue"), img("vodka-pink")],
    has_variants: false,
    price_range: null,
  },
];

export const CATEGORIES = [
  { id: "c-apparel", name: "Apparel", slug: "apparel", image_url: null },
  { id: "c-accessories", name: "Accessories", slug: "accessories", image_url: null },
  { id: "c-home", name: "Home", slug: "home", image_url: null },
  { id: "c-lighting", name: "Lighting", slug: "lighting", image_url: null },
  { id: "c-beverages", name: "Beverages", slug: "beverages", image_url: null },
].map((c) => ({
  ...c,
  product_count: PRODUCTS.filter((p) => p.category_slug === c.slug).length,
}));
