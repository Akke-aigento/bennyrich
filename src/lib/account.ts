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
