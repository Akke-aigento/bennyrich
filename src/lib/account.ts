/**
 * Shapes and unwrapping for the customer account area.
 *
 * The customer-api's exact response envelopes are not documented and cannot be
 * checked from here (the API key is a Cloud secret), so every read goes through
 * a tolerant unwrapper: a bare array and the obvious wrapper objects are all
 * accepted. Guessing wrong should mean an empty list, never a crash.
 */

export type CustomerAddress = {
  id?: string;
  address_id?: string;
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  /**
   * Core's address rows are jsonb and may not carry a default flag at all.
   * Nothing in the UI assumes it — see hasDefaultFlag().
   */
  is_default?: boolean;
  default?: boolean;
};

/**
 * An order as the list endpoint returns it. Core selects a fixed, narrow set of
 * columns for get_orders; get_order returns the whole row plus its items, so the
 * detail type is deliberately looser.
 */
export type CustomerOrder = {
  id?: string;
  order_number?: string;
  status?: string;
  payment_status?: string;
  total?: number | string;
  currency?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type CustomerOrderItem = {
  product_name?: string;
  quantity?: number;
  unit_price?: number | string;
  total?: number | string;
  product_image?: string;
};

export type CustomerOrderDetail = CustomerOrder & {
  order_items?: CustomerOrderItem[];
  subtotal?: number | string;
  shipping_cost?: number | string;
  tax_amount?: number | string;
  shipping_address?: unknown;
  billing_address?: unknown;
};

export type WishlistEntry = {
  id?: string;
  product_id?: string;
  product?: unknown;
  [key: string]: unknown;
};

/** First array found under any of `keys`, or the value itself if it is one. */
function unwrapList<T>(raw: unknown, keys: string[]): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as T[];
  }
  return [];
}

export function unwrapAddresses(raw: unknown): CustomerAddress[] {
  return unwrapList<CustomerAddress>(raw, ["addresses", "items", "data", "results"]);
}

export function unwrapWishlist(raw: unknown): WishlistEntry[] {
  return unwrapList<WishlistEntry>(raw, ["items", "wishlist", "products", "favorites", "data"]);
}

export function unwrapOrders(raw: unknown): CustomerOrder[] {
  return unwrapList<CustomerOrder>(raw, ["orders", "items", "data", "results"]);
}

/** The single order behind get_order, whatever envelope it arrives in. */
export function unwrapOrder(raw: unknown): CustomerOrderDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  for (const key of ["order", "data"]) {
    const nested = obj[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested as CustomerOrderDetail;
    }
  }
  return obj as CustomerOrderDetail;
}

/**
 * A money field, whatever type it arrives as. Totals are ALWAYS taken from the
 * API — nothing here adds anything up.
 */
export function orderAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Core's status vocabulary is snake_case and aimed at the admin. Anything we do
 * not have a phrase for falls back to the raw value with the underscores taken
 * out, so a new status shows up readable instead of blank.
 */
const ORDER_STATUS_EN: Record<string, string> = {
  pending: "Pending",
  processing: "Being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  partially_returned: "Partly returned",
};

const PAYMENT_STATUS_EN: Record<string, string> = {
  unpaid: "Awaiting payment",
  paid: "Paid",
  refunded: "Refunded",
  partially_refunded: "Partly refunded",
  failed: "Payment failed",
};

function humanise(value: string | undefined, map: Record<string, string>): string | null {
  if (!value) return null;
  return map[value] ?? value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function orderStatusLabel(order: CustomerOrder): string | null {
  return humanise(order.status, ORDER_STATUS_EN);
}

export function paymentStatusLabel(order: CustomerOrder): string | null {
  return humanise(order.payment_status, PAYMENT_STATUS_EN);
}

/** Order date in the site's English voice: "12 March 2026". */
export function formatOrderDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** The identifier the update/delete actions expect. */
export function addressId(address: CustomerAddress): string | undefined {
  return address.id ?? address.address_id;
}

export function isDefaultAddress(address: CustomerAddress): boolean {
  return address.is_default === true || address.default === true;
}

/**
 * Whether the API is speaking about defaults at all.
 *
 * If no address carries the field, the UI hides every default affordance
 * rather than inventing a concept the backend does not have.
 */
export function hasDefaultFlag(addresses: CustomerAddress[]): boolean {
  return addresses.some((a) => "is_default" in a || "default" in a);
}

/** A one-line summary for an address card. */
export function formatAddressLines(address: CustomerAddress): string[] {
  const name = [address.first_name, address.last_name].filter(Boolean).join(" ").trim();
  return [
    name,
    address.address_line_1,
    address.address_line_2,
    [address.postal_code, address.city].filter(Boolean).join(" ").trim(),
  ].filter((line): line is string => Boolean(line && line.trim()));
}
