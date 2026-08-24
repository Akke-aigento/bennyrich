import { createServerFn } from "@tanstack/react-start";

import { SITE_URL } from "./site";

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
        return {
          action: "cart_add_item",
          tenant_id: tenantId,
          params: { ...params, ...(body ?? {}) },
        };
      }
      if (segments.length === 4) {
        params.item_id = segments[3];
        if (method === "PUT" || method === "PATCH") {
          return {
            action: "cart_update_item",
            tenant_id: tenantId,
            params: { ...params, ...(body ?? {}) },
          };
        }
        if (method === "DELETE") {
          return { action: "cart_remove_item", tenant_id: tenantId, params };
        }
      }
    }
    if (segments[2] === "discount") {
      if (method === "POST") {
        return {
          action: "cart_apply_discount",
          tenant_id: tenantId,
          params: { ...params, ...(body ?? {}) },
        };
      }
      if (method === "DELETE") {
        return {
          action: "cart_remove_discount",
          tenant_id: tenantId,
          params: { ...params, ...(body ?? {}) },
        };
      }
    }
  }

  if (segments[0] === "checkout") {
    if (segments.length === 1 && method === "POST") {
      return {
        action: "checkout_start",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "customer" && method === "POST") {
      return {
        action: "checkout_customer",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "address" && method === "POST") {
      return {
        action: "checkout_address",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "shipping" && method === "POST") {
      return {
        action: "checkout_shipping",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "select-payment-method" && method === "POST") {
      return {
        action: "checkout_select_payment_method",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "complete" && method === "POST") {
      return {
        action: "checkout_complete",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "discount" && method === "POST") {
      return {
        action: "checkout_apply_discount",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
    }
    if (segments[1] === "discount" && method === "DELETE") {
      return {
        action: "checkout_remove_discount",
        tenant_id: tenantId,
        params: { ...params, ...(body ?? {}) },
      };
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
    return {
      action: "newsletter_subscribe",
      tenant_id: tenantId,
      params: { ...params, ...(body ?? {}) },
    };
  }

  if (segments[0] === "contact" && method === "POST") {
    return {
      action: "submit_contact",
      tenant_id: tenantId,
      params: { ...params, ...(body ?? {}) },
    };
  }

  return {
    action: segments.join("_"),
    tenant_id: tenantId,
    params: { ...params, ...q, ...(body ?? {}) },
  };
}

// ---------------------------------------------------------------------------
// Customer API (BR-9a)
//
// SellQo core runs a SECOND edge function, `storefront-customer-api`, for
// customer auth: register/login, profile, orders, addresses, wishlist. It speaks
// the same { action, tenant_id, params } protocol and the same X-API-Key, plus
// an `x-storefront-token` bearer for authed actions.
//
// This is bolted on ADDITIVELY. `resolveAction` and the storefront-api request
// path below are untouched; customer paths branch out before any of it runs.
//
// NAMING, so nobody trips: the proxy paths below (`/account/me`, `/wishlist`)
// are an internal REST-ish vocabulary for this function. They are NOT the app's
// /account/* routes, which merely happen to share a prefix.
//
// THE TOKEN NEVER REACHES THE BROWSER. login/register responses are intercepted
// here: the token goes into an httpOnly cookie and is stripped from the payload
// returned to the client. That is the whole reason this lives in the proxy —
// a cookie written by client JS is no safer than localStorage, because script
// injected into the page can read both.
// ---------------------------------------------------------------------------

const CUSTOMER_PATH_RE = /^\/(auth|account|wishlist)(\/|$)/;

const TOKEN_COOKIE = "br_customer_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // the customer-api issues a 7-day JWT

/** Actions the edge function requires a bearer token for. */
const PUBLIC_CUSTOMER_ACTIONS = new Set([
  "register",
  "login",
  "request_password_reset",
  "reset_password",
  // The verification link is clicked from an email, often in a different
  // browser than the one holding the session cookie. Requiring a token here
  // would make the link unusable for exactly the people who need it.
  "verify_email",
]);

/**
 * Actions whose email carries a link back into this storefront. Core allowlists
 * `url_base` against the tenant's verified domains, so a wrong value does not
 * become an open redirect — it just makes the link land somewhere useless.
 * Injected server-side so the browser cannot influence it.
 */
const URL_BASE_ACTIONS = new Set(["register", "request_password_reset"]);

export function isCustomerPath(path: string): boolean {
  return CUSTOMER_PATH_RE.test(path);
}

/**
 * Map the REST-ish customer paths onto customer-api actions. Separate from
 * `resolveAction` on purpose — the two APIs share a protocol, not a vocabulary.
 *
 * The full map lands in one go, including the orders/addresses/wishlist routes
 * BR-9b will use, so this file is opened once rather than twice.
 */
function resolveCustomerAction(
  method: string,
  path: string,
  query: Record<string, string | number | undefined>,
  body: Record<string, unknown> | null,
): { action: string; params: Record<string, unknown> } | null {
  const segments = path.replace(/^\//, "").split("/").filter(Boolean);
  const q: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") q[k] = String(v);
  }
  const withBody = { ...q, ...(body ?? {}) };

  if (segments[0] === "auth") {
    if (method === "POST") {
      if (segments[1] === "register") return { action: "register", params: withBody };
      if (segments[1] === "login") return { action: "login", params: withBody };
      if (segments[1] === "forgot") return { action: "request_password_reset", params: withBody };
      if (segments[1] === "reset") return { action: "reset_password", params: withBody };
      if (segments[1] === "verify") return { action: "verify_email", params: withBody };
    }
    return null;
  }

  if (segments[0] === "account") {
    if (segments[1] === "me") {
      if (method === "GET") return { action: "get_profile", params: {} };
      if (method === "PATCH" || method === "PUT")
        return { action: "update_profile", params: withBody };
    }
    if (segments[1] === "password" && method === "POST")
      return { action: "change_password", params: withBody };

    if (segments[1] === "resend-verification" && method === "POST")
      return { action: "resend_verification", params: withBody };

    if (segments[1] === "orders") {
      if (segments.length === 2 && method === "GET") return { action: "get_orders", params: q };
      if (segments.length === 3 && method === "GET")
        return { action: "get_order", params: { ...q, order_id: segments[2] } };
    }

    if (segments[1] === "addresses") {
      if (segments.length === 2 && method === "GET") return { action: "get_addresses", params: {} };
      if (segments.length === 2 && method === "POST")
        return { action: "add_address", params: withBody };
      if (segments.length === 3 && (method === "PATCH" || method === "PUT"))
        return { action: "update_address", params: { ...withBody, address_id: segments[2] } };
      if (segments.length === 3 && method === "DELETE")
        return { action: "delete_address", params: { address_id: segments[2] } };
    }
    return null;
  }

  if (segments[0] === "wishlist") {
    if (segments.length === 1 && method === "GET") return { action: "wishlist_get", params: {} };
    if (segments.length === 1 && method === "POST")
      return { action: "wishlist_add", params: withBody };
    if (segments.length === 2 && method === "DELETE")
      return { action: "wishlist_remove", params: { product_id: segments[1] } };
  }

  return null;
}

/**
 * Cookie helpers, loaded lazily.
 *
 * `@tanstack/react-start/server` is server-only and this module is imported by
 * client code, so importing it at the top level risks pulling server code into
 * the browser bundle. Inside the handler the server-fn boundary strips it.
 */
async function cookieApi() {
  return await import("@tanstack/react-start/server");
}

async function readCustomerToken(): Promise<string | undefined> {
  try {
    const { getCookie } = await cookieApi();
    return getCookie(TOKEN_COOKIE) ?? undefined;
  } catch {
    return undefined;
  }
}

async function writeCustomerToken(token: string): Promise<void> {
  try {
    const { setCookie } = await cookieApi();
    setCookie(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
      // Secure would stop the cookie being set over plain http, which is what
      // local development runs on.
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.warn("[customer-api] could not set the session cookie:", error);
  }
}

async function clearCustomerToken(): Promise<void> {
  try {
    const { setCookie } = await cookieApi();
    setCookie(TOKEN_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    /* nothing to clear */
  }
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
      data.body && typeof data.body === "object" ? (data.body as Record<string, unknown>) : null;

    // --- Customer API branch ------------------------------------------------
    // Taken before anything below runs, so the storefront-api path is unchanged.
    if (isCustomerPath(data.path)) {
      // Logout never leaves this function: there is nothing to invalidate
      // upstream, the session IS the cookie.
      if (method === "POST" && /^\/auth\/logout\/?$/.test(data.path)) {
        await clearCustomerToken();
        return { ok: true } as any;
      }

      const resolved = resolveCustomerAction(method, data.path, data.query ?? {}, bodyObj);
      if (!resolved) {
        throw new Error(`sellqoProxy: unsupported customer route ${method} ${data.path}`);
      }

      // Derive the customer endpoint from the URL already validated above, so
      // the existing guard keeps doing its job and there is no second secret.
      const customerUrl = url.replace(
        "/functions/v1/storefront-api",
        "/functions/v1/storefront-customer-api",
      );

      // The verification and reset emails link back here. Core builds that link
      // from `url_base`, so it has to come from us — and from the server, not
      // from the browser, or the value in a security-sensitive email would be
      // whatever the caller felt like sending.
      if (URL_BASE_ACTIONS.has(resolved.action)) {
        resolved.params = { ...resolved.params, url_base: SITE_URL };
      }

      const needsAuth = !PUBLIC_CUSTOMER_ACTIONS.has(resolved.action);
      const token = needsAuth ? await readCustomerToken() : undefined;
      if (needsAuth && !token) {
        throw new Error("NOT_AUTHENTICATED");
      }

      const customerRes = await fetch(customerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          accept: "application/json",
          ...(token ? { "x-storefront-token": token } : {}),
        },
        body: JSON.stringify({
          action: resolved.action,
          tenant_id: tenantId,
          params: resolved.params,
        }),
      });

      const customerText = await customerRes.text();
      let customerJson: any = null;
      try {
        customerJson = customerText ? JSON.parse(customerText) : null;
      } catch {
        customerJson = { raw: customerText };
      }

      // Core answers 403 for an unverified address on the order endpoints. That
      // is a live, valid session hitting a gate — not a dead token. Clearing the
      // cookie here would sign the customer out for clicking "Orders", which is
      // the opposite of what the gate is for. Checked BEFORE the 401/403 branch.
      if (customerJson?.error === "EMAIL_NOT_VERIFIED") {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      // A rejected token is dead weight — drop it so the client cannot loop on
      // a session the server has already stopped honouring.
      if (customerRes.status === 401 || customerRes.status === 403) {
        await clearCustomerToken();
        throw new Error("NOT_AUTHENTICATED");
      }

      if (!customerRes.ok) {
        const message =
          customerJson?.error ??
          customerJson?.message ??
          `SellQo customer API ${customerRes.status} ${customerRes.statusText}`;
        throw new Error(typeof message === "string" ? message : JSON.stringify(message));
      }

      const payloadData =
        customerJson && typeof customerJson === "object" && "data" in customerJson
          ? customerJson.data
          : customerJson;

      // Capture the session and keep it out of the browser entirely.
      if (
        (resolved.action === "login" || resolved.action === "register") &&
        payloadData &&
        typeof payloadData === "object" &&
        typeof payloadData.token === "string"
      ) {
        await writeCustomerToken(payloadData.token);
        const { token: _token, ...withoutToken } = payloadData;
        return withoutToken as any;
      }

      return payloadData as any;
    }
    // --- end Customer API branch --------------------------------------------

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
