import { createServerFn } from "@tanstack/react-start";

type ProxyInput = {
  path: string;
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

const DEFAULT_SELLQO_API_URL =
  "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api";

/**
 * Translate REST-style (path + method + body + query) into the SellQo
 * Storefront API's action protocol: POST { action, tenant_id, params }.
 * Mirrors the mapping used by other SellQo storefronts (e.g. Mancini Milano).
 */
function resolveAction(
  method: string,
  path: string,
  query: Record<string, string | number | undefined>,
  body: Record<string, unknown> | null,
  tenantId: string,
): { action: string; tenant_id: string; params: Record<string, unknown> } {
  const segments = path.replace(/^\//, "").split("/").filter(Boolean);
  const params: Record<string, unknown> = {};
  const q: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") q[k] = String(v);
  }

  if (segments[0] === "products") {
    if (segments.length === 1) {
      Object.assign(params, q);
      if (q.search || q.q) {
        params.query = q.search || q.q;
        return { action: "search_products", tenant_id: tenantId, params };
      }
      return { action: "get_products", tenant_id: tenantId, params };
    }
    if (segments[1] === "search") {
      params.query = q.q || "";
      if (q.limit) params.limit = Number(q.limit);
      return { action: "search_products", tenant_id: tenantId, params };
    }
    if (segments.length === 2) {
      params.slug = segments[1];
      return { action: "get_product", tenant_id: tenantId, params };
    }
    if (segments.length === 3 && segments[2] === "related") {
      params.slug = segments[1];
      if (q.limit) params.limit = Number(q.limit);
      return { action: "get_product", tenant_id: tenantId, params };
    }
  }

  if (segments[0] === "collections") {
    if (segments.length >= 2 && segments[2] === "products") {
      params.category_slug = segments[1];
      Object.assign(params, q);
      return { action: "get_products", tenant_id: tenantId, params };
    }
    return { action: "get_categories", tenant_id: tenantId, params };
  }

  if (segments[0] === "categories") {
    return { action: "get_categories", tenant_id: tenantId, params };
  }

  if (segments[0] === "cart") {
    if (segments.length === 1 && method === "POST") {
      return { action: "cart_create", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments.length === 1 && method === "GET") {
      // GET /cart?session_id=... → cart_get by session
      Object.assign(params, q);
      return { action: "cart_get", tenant_id: tenantId, params };
    }
    const cartId = segments[1];
    if (cartId) params.cart_id = cartId;
    if (segments.length === 2 && method === "GET") {
      return { action: "cart_get", tenant_id: tenantId, params };
    }
    if (segments.length === 2 && method === "DELETE") {
      return { action: "cart_clear", tenant_id: tenantId, params };
    }
    if (segments[2] === "items") {
      if (segments.length === 3 && method === "POST") {
        return { action: "cart_add_item", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
      }
      if (segments.length === 4) {
        params.item_id = segments[3];
        if (method === "PUT" || method === "PATCH") {
          return { action: "cart_update_item", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
        }
        if (method === "DELETE") {
          return { action: "cart_remove_item", tenant_id: tenantId, params };
        }
      }
    }
    if (segments[2] === "discount") {
      if (method === "POST") {
        return { action: "cart_apply_discount", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
      }
      if (method === "DELETE") {
        return { action: "cart_remove_discount", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
      }
    }
  }

  if (segments[0] === "checkout") {
    if (segments.length === 1 && method === "POST") {
      return { action: "checkout_start", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "customer" && method === "POST") {
      return { action: "checkout_customer", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "address" && method === "POST") {
      return { action: "checkout_address", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "shipping" && method === "POST") {
      return { action: "checkout_shipping", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "select-payment-method" && method === "POST") {
      return { action: "checkout_select_payment_method", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "complete" && method === "POST") {
      return { action: "checkout_complete", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "discount" && method === "POST") {
      return { action: "checkout_apply_discount", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "discount" && method === "DELETE") {
      return { action: "checkout_remove_discount", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
    }
    if (segments[1] === "order" && method === "GET") {
      Object.assign(params, q);
      return { action: "checkout_get_order", tenant_id: tenantId, params };
    }
    if (segments[1] === "confirmation" && segments[2] && method === "GET") {
      params.order_id = segments[2];
      return { action: "checkout_get_confirmation", tenant_id: tenantId, params };
    }
  }

  if (segments[0] === "newsletter" && method === "POST") {
    return { action: "newsletter_subscribe", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
  }

  if (segments[0] === "contact" && method === "POST") {
    return { action: "submit_contact", tenant_id: tenantId, params: { ...params, ...(body ?? {}) } };
  }

  return {
    action: segments.join("_"),
    tenant_id: tenantId,
    params: { ...params, ...q, ...(body ?? {}) },
  };
}

export const sellqoProxy = createServerFn({ method: "POST" })
  .inputValidator((data: ProxyInput) => {
    if (!data || typeof data.path !== "string") {
      throw new Error("sellqoProxy: 'path' is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const baseRaw = process.env.SELLQO_API_URL;
    const apiKey = process.env.SELLQO_API_KEY;
    const tenantId = process.env.SELLQO_TENANT_ID;

    if (!apiKey) {
      throw new Error("SellQo proxy is not configured. Missing SELLQO_API_KEY secret.");
    }
    if (!tenantId) {
      throw new Error("SellQo proxy is not configured. Missing SELLQO_TENANT_ID secret.");
    }

    // Default to the canonical storefront-api endpoint; if the secret points
    // at the marketing site (e.g. https://sellqo.app/), override it.
    let url = baseRaw && baseRaw.trim() ? baseRaw.trim() : DEFAULT_SELLQO_API_URL;
    if (!/\/functions\/v1\/storefront-api/.test(url)) {
      url = DEFAULT_SELLQO_API_URL;
    }

    const method = (data.method ?? "GET").toUpperCase();
    const bodyObj =
      data.body && typeof data.body === "object"
        ? (data.body as Record<string, unknown>)
        : null;

    const payload = resolveAction(method, data.path, data.query ?? {}, bodyObj, tenantId);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const looksLikeHtml = /^\s*<(!doctype|html)/i.test(text);
    if (looksLikeHtml) {
      throw new Error(
        `SellQo upstream returned HTML instead of JSON (status ${res.status}). ` +
          `Check SELLQO_API_URL — it must point to the storefront-api endpoint, not the marketing site.`,
      );
    }

    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      const message =
        (json && typeof json === "object" && "error" in json && (json as any).error) ||
        (json && typeof json === "object" && "message" in json && (json as any).message) ||
        `SellQo ${res.status} ${res.statusText}`;
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }

    // SellQo storefront wraps payloads as { success, data }. Unwrap so callers
    // get the same shape as a REST API would return.
    if (json && typeof json === "object" && "success" in (json as any) && "data" in (json as any)) {
      return (json as any).data;
    }
    return json as any;
  });