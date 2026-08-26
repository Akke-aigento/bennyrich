/**
 * Local SellQo storefront-api mock.  Dev-only — nothing in `src/` imports it.
 *
 *   bun tools/mock/server.ts
 *   SELLQO_API_KEY=mock SELLQO_TENANT_ID=mock \
 *   SELLQO_API_URL=http://localhost:8788/functions/v1/storefront-api bun run dev
 *
 * The API key is a Lovable Cloud secret, so a plain `bun run dev` cannot reach
 * the real SellQo. This exists so the storefront can be driven and screenshotted
 * locally.
 *
 * It speaks the storefront action protocol `POST { action, tenant_id, params }`
 * and answers `{ success: true, data }` — sellqoProxy unwraps `.data`. The path
 * must contain `/functions/v1/storefront-api` or the proxy rejects the URL
 * outright and falls back to the real endpoint.
 *
 * Rebuilt in BR-11: BR-9b/BR-10 kept this in a scratchpad and it was lost. It
 * lives in the repo now so the next batch does not pay for it again.
 */
import { CATEGORIES, PRODUCTS, categoryOf, type MockProduct } from "./fixtures";

const PORT = Number(process.env.MOCK_PORT ?? 8788);

type Carts = Map<string, { id: string; items: CartItem[] }>;
type CartItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
};

const carts: Carts = new Map();
let cartSeq = 0;
let itemSeq = 0;

function ok(data: unknown) {
  return Response.json({ success: true, data });
}

function fail(status: number, error: string) {
  return Response.json({ success: false, error }, { status });
}

function bySlug(slug: string): MockProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Shape a fixture the way live shapes a product row: `category_slug` is a
 * fixture-only join key and never leaves the mock; in its place goes the
 * `category: {id,name,slug}` object the real API attaches. There is
 * deliberately NO `featured_image` — live has no such field, only `images`.
 */
function strip(p: MockProduct) {
  const { category_slug, ...rest } = p;
  return { ...rest, category: categoryOf(category_slug) };
}

function listProducts(params: Record<string, any>) {
  let out = PRODUCTS;
  const slug = params.category_slug ?? params.category;
  if (slug) out = out.filter((p) => p.category_slug === slug);
  const search = String(params.query ?? params.search ?? params.q ?? "")
    .trim()
    .toLowerCase();
  if (search) out = out.filter((p) => p.name.toLowerCase().includes(search));
  const perPage = Number(params.per_page ?? 100);
  const page = Number(params.page ?? 1);
  const total = out.length;
  const slice = out.slice((page - 1) * perPage, page * perPage);
  return {
    products: slice.map(strip),
    pagination: {
      page,
      per_page: perPage,
      total_count: total,
      total_pages: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}

function cartPayload(cartId: string) {
  const cart = carts.get(cartId);
  if (!cart) return null;
  const items = cart.items.map((it) => {
    const product = PRODUCTS.find((p) => p.id === it.product_id);
    const variant = product?.variants?.find((v) => v.id === it.variant_id);
    const price = variant?.price ?? product?.price ?? 0;
    return {
      id: it.id,
      product_id: it.product_id,
      variant_id: it.variant_id,
      name: product?.name ?? "Item",
      slug: product?.slug,
      // Same trap as live: the variant carries `attribute_values` only, so
      // `normalizeCart` produces variant_label: null and cart-labels.ts has to
      // resolve it in presentation.
      variant: variant ? { id: variant.id, attribute_values: variant.attribute_values } : undefined,
      product: product ? { id: product.id, slug: product.slug, images: product.images } : undefined,
      price,
      quantity: it.quantity,
      line_total: price * it.quantity,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  return {
    cart: {
      id: cart.id,
      items,
      item_count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      total: subtotal,
      currency: "EUR",
    },
  };
}

function ensureCart(id?: string) {
  if (id && carts.has(id)) return carts.get(id)!;
  const cart = { id: `cart-${++cartSeq}`, items: [] as CartItem[] };
  carts.set(cart.id, cart);
  return cart;
}

function handle(action: string, params: Record<string, any>): Response {
  switch (action) {
    case "get_products":
    case "search_products":
      return ok(listProducts(params));

    case "get_product": {
      const product = bySlug(String(params.slug ?? params.id ?? ""));
      if (!product) return fail(404, "PRODUCT_NOT_FOUND");
      return ok({
        product: {
          ...strip(product),
          related_products: PRODUCTS.filter(
            (p) => p.category_slug === product.category_slug && p.id !== product.id,
          )
            .slice(0, 4)
            .map(strip),
        },
      });
    }

    // Live returns a BARE ARRAY here, not { categories: [...] }.
    case "get_categories":
      return ok(CATEGORIES);

    case "cart_create":
      return ok(cartPayload(ensureCart().id));

    case "cart_get": {
      const cart = ensureCart(params.cart_id);
      return ok(cartPayload(cart.id));
    }

    case "cart_add_item": {
      const cart = ensureCart(params.cart_id);
      const existing = cart.items.find(
        (i) => i.product_id === params.product_id && i.variant_id === (params.variant_id ?? null),
      );
      if (existing) existing.quantity += Number(params.quantity ?? 1);
      else
        cart.items.push({
          id: `item-${++itemSeq}`,
          product_id: String(params.product_id),
          variant_id: params.variant_id ?? null,
          quantity: Number(params.quantity ?? 1),
        });
      return ok(cartPayload(cart.id));
    }

    case "cart_update_item": {
      const cart = ensureCart(params.cart_id);
      const item = cart.items.find((i) => i.id === params.item_id);
      if (item) item.quantity = Number(params.quantity ?? 1);
      return ok(cartPayload(cart.id));
    }

    case "cart_remove_item": {
      const cart = ensureCart(params.cart_id);
      cart.items = cart.items.filter((i) => i.id !== params.item_id);
      return ok(cartPayload(cart.id));
    }

    case "cart_clear": {
      const cart = ensureCart(params.cart_id);
      cart.items = [];
      return ok(cartPayload(cart.id));
    }

    case "submit_contact":
    case "newsletter_subscribe":
      return ok({ ok: true });

    default:
      return fail(400, `MOCK_UNSUPPORTED_ACTION:${action}`);
  }
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method !== "POST") return new Response("mock storefront-api", { status: 200 });
    if (!url.pathname.includes("/functions/v1/storefront-api")) {
      return fail(404, "WRONG_PATH");
    }
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return fail(400, "BAD_JSON");
    }
    const action = String(body?.action ?? "");
    const params = (body?.params ?? {}) as Record<string, any>;
    const res = handle(action, params);
    console.log(`[mock] ${action} ${res.status}`);
    return res;
  },
});

console.log(`[mock] storefront-api on http://localhost:${PORT}/functions/v1/storefront-api`);
