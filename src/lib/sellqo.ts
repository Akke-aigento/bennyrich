import { sellqoProxy } from "./sellqo.functions";

export type SellqoImage = string | { url: string; alt?: string };

export type SellqoProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  images?: SellqoImage[];
  featured_image?: SellqoImage | null;
  in_stock?: boolean;
  coming_soon?: boolean;
  has_variants?: boolean;
  sku?: string;
  price_range?: { min: number; max: number } | null;
  variants?: Array<{
    id: string;
    name?: string;
    price?: number;
    sku?: string;
    option_values?: Record<string, string>;
    in_stock?: boolean;
  }>;
  options?: Array<{ name: string; values: string[] }>;
  related_products?: SellqoProduct[];
};

export type SellqoPagination = {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};

export type SellqoCartItem = {
  id: string;
  product_id: string;
  variant_id?: string | null;
  name: string;
  slug?: string;
  image?: string | null;
  price: number;
  quantity: number;
  line_total?: number;
  variant_label?: string | null;
};

export type SellqoCart = {
  id: string;
  item_count: number;
  items: SellqoCartItem[];
  subtotal: number;
  total?: number;
  currency?: string;
};

/** Best-effort normalisation of the various SellQo cart response shapes. */
export function normalizeCart(raw: any): SellqoCart | null {
  if (!raw) return null;
  const c = raw.cart ?? raw;
  const id = c?.id ?? c?.cart_id ?? raw?.cart_id;
  if (!id) return null;
  const rawItems: any[] = c.items ?? c.line_items ?? [];
  const items: SellqoCartItem[] = rawItems.map((it) => {
    const image =
      imageUrl(it.image) ??
      imageUrl(it.image_url) ??
      imageUrl(it.thumbnail) ??
      imageUrl(it.thumbnail_url) ??
      imageUrl(it.featured_image) ??
      imageUrl(it.product?.image) ??
      imageUrl(it.product?.image_url) ??
      imageUrl(it.product?.thumbnail) ??
      imageUrl(it.product?.thumbnail_url) ??
      imageUrl(it.product?.featured_image) ??
      imageUrl(it.product?.images?.[0]) ??
      imageUrl(it.variant?.image) ??
      imageUrl(it.variant?.image_url) ??
      null;
    if (!image && typeof console !== "undefined") {
      console.debug("[cart] item without image:", it);
    }
    const price = Number(it.price ?? it.unit_price ?? it.product?.price ?? 0);
    const quantity = Number(it.quantity ?? it.qty ?? 1);
    return {
      id: String(it.id ?? it.item_id ?? it.line_id),
      product_id: String(it.product_id ?? it.product?.id ?? ""),
      variant_id: it.variant_id ?? it.variant?.id ?? null,
      name: String(it.name ?? it.product_name ?? it.product?.name ?? "Item"),
      slug: it.slug ?? it.product?.slug ?? undefined,
      image,
      price,
      quantity,
      line_total: Number(it.line_total ?? it.total ?? price * quantity),
      variant_label:
        it.variant_label ??
        it.variant?.name ??
        (it.variant?.option_values
          ? Object.values(it.variant.option_values).join(" · ")
          : null),
    };
  });
  const subtotal = Number(
    c.subtotal ?? c.subtotal_amount ?? items.reduce((s, i) => s + (i.line_total ?? 0), 0),
  );
  const item_count = Number(
    c.item_count ?? items.reduce((s, i) => s + i.quantity, 0),
  );
  return {
    id: String(id),
    item_count,
    items,
    subtotal,
    total: c.total != null ? Number(c.total) : undefined,
    currency: c.currency ?? "EUR",
  };
}

export function imageUrl(img?: SellqoImage | null): string | null {
  if (!img) return null;
  return typeof img === "string" ? img : img.url ?? null;
}

export function productCover(p: SellqoProduct): string | null {
  return (
    imageUrl(p.featured_image) ??
    imageUrl(p.images?.[0] ?? null) ??
    null
  );
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

type FetchOpts = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

/**
 * Frontend helper that calls SellQo through the server-side proxy.
 * Pass a SellQo API path (e.g. "/products", "/products/slug", "/cart").
 * Query params can be embedded in `path` or passed via `query`.
 */
export async function sellqoFetch<T = unknown>(
  path: string,
  opts: FetchOpts = {},
): Promise<T> {
  // Split inline query string into the proxy's `query` map so the server fn
  // can rebuild the URL cleanly.
  let cleanPath = path;
  const query: Record<string, string | number | undefined> = { ...(opts.query ?? {}) };
  const qIdx = path.indexOf("?");
  if (qIdx >= 0) {
    cleanPath = path.slice(0, qIdx);
    const sp = new URLSearchParams(path.slice(qIdx + 1));
    sp.forEach((v, k) => {
      query[k] = v;
    });
  }

  return (await sellqoProxy({
    data: {
      path: cleanPath,
      method: opts.method ?? "GET",
      body: opts.body,
      query,
    },
  })) as T;
}

// --- Cart session helpers (browser-only) ------------------------------------
const SESSION_KEY = "zd_session_id";
const CART_KEY = "zd_cart_id";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_KEY);
}

export function storeCartId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, id);
}

export function clearCartId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_KEY);
}

export async function ensureCartId(): Promise<string> {
  const existing = getStoredCartId();
  if (existing) return existing;
  const sessionId = getOrCreateSessionId();
  const raw = await sellqoFetch<any>("/cart", {
    method: "POST",
    body: { session_id: sessionId },
  });
  const id = raw?.cart_id ?? raw?.id ?? raw?.cart?.id;
  if (!id) throw new Error("SellQo: cart_id missing in /cart response");
  storeCartId(id);
  return id;
}

export async function fetchCart(): Promise<SellqoCart | null> {
  const cartId = getStoredCartId();
  try {
    if (cartId) {
      const raw = await sellqoFetch<any>(`/cart/${cartId}`);
      const cart = normalizeCart(raw);
      if (cart) return cart;
      // cart id no longer valid on the server
      clearCartId();
    }
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return null;
    const raw = await sellqoFetch<any>("/cart", { query: { session_id: sessionId } });
    const cart = normalizeCart(raw);
    if (cart) storeCartId(cart.id);
    return cart;
  } catch {
    return null;
  }
}