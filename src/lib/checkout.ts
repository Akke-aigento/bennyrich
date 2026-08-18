import { getStoredCartId, sellqoFetch } from "./sellqo";

export type ShippingMethod = {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimated_delivery?: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  description?: string;
  code?: string;
};

export type CheckoutState = {
  order_id?: string | null;
  customer?: {
    email?: string;
    phone?: string | null;
    first_name?: string;
    last_name?: string;
  } | null;
  shipping_address?: any;
  billing_address?: any;
  shipping_methods?: ShippingMethod[];
  selected_shipping_method_id?: string | null;
  payment_methods?: PaymentMethod[];
  selected_payment_method_id?: string | null;
  subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  total?: number;
  currency?: string;
  raw?: any;
};

function pickArray(...vals: any[]): any[] {
  for (const v of vals) if (Array.isArray(v)) return v;
  return [];
}

export function normalizeCheckout(raw: any): CheckoutState {
  if (!raw) return { raw };
  const src = raw.checkout ?? raw.order ?? raw;
  const shippingMethods: ShippingMethod[] = pickArray(
    src.shipping_methods,
    src.available_shipping_methods,
    raw.shipping_methods,
  ).map((m: any) => ({
    id: String(m.id ?? m.code ?? m.method_id),
    name: String(m.name ?? m.title ?? m.label ?? "Shipping"),
    description: m.description ?? m.subtitle ?? undefined,
    price: Number(m.price ?? m.amount ?? m.cost ?? 0),
    estimated_delivery: m.estimated_delivery ?? m.eta ?? undefined,
  }));
  const paymentMethods: PaymentMethod[] = pickArray(
    src.payment_methods,
    src.available_payment_methods,
    raw.payment_methods,
  ).map((m: any) => ({
    id: String(m.id ?? m.code ?? m.method_id),
    name: String(m.name ?? m.title ?? m.label ?? "Payment"),
    description: m.description ?? m.subtitle ?? undefined,
    code: m.code ?? m.provider ?? undefined,
  }));
  return {
    order_id: src.order_id ?? src.id ?? raw.order_id ?? null,
    customer: src.customer ?? null,
    shipping_address: src.shipping_address ?? null,
    billing_address: src.billing_address ?? null,
    shipping_methods: shippingMethods,
    selected_shipping_method_id:
      src.selected_shipping_method_id ?? src.shipping_method_id ?? null,
    payment_methods: paymentMethods,
    selected_payment_method_id:
      src.selected_payment_method_id ?? src.payment_method_id ?? null,
    subtotal: num(src.subtotal),
    shipping_total: num(src.shipping_total ?? src.shipping_amount),
    tax_total: num(src.tax_total ?? src.tax_amount),
    total: num(src.total ?? src.total_amount),
    currency: src.currency ?? "EUR",
    raw,
  };
}

function num(v: any): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function checkoutStart() {
  const cart_id = getStoredCartId();
  if (!cart_id) throw new Error("No active cart");
  const raw = await sellqoFetch<any>("/checkout", {
    method: "POST",
    body: { cart_id },
  });
  return normalizeCheckout(raw);
}

export async function checkoutSetCustomer(input: {
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  accepts_marketing?: boolean;
}) {
  const cart_id = getStoredCartId();
  const raw = await sellqoFetch<any>("/checkout/customer", {
    method: "POST",
    body: { cart_id, ...input },
  });
  return normalizeCheckout(raw);
}

export async function checkoutSetAddress(input: {
  shipping_address: any;
  billing_address?: any;
  billing_same_as_shipping?: boolean;
}) {
  const cart_id = getStoredCartId();
  const raw = await sellqoFetch<any>("/checkout/address", {
    method: "POST",
    body: { cart_id, ...input },
  });
  return normalizeCheckout(raw);
}

export async function checkoutSetShipping(shipping_method_id: string) {
  const cart_id = getStoredCartId();
  const raw = await sellqoFetch<any>("/checkout/shipping", {
    method: "POST",
    body: { cart_id, shipping_method_id },
  });
  return normalizeCheckout(raw);
}

export async function checkoutSelectPayment(payment_method_id: string) {
  const cart_id = getStoredCartId();
  const raw = await sellqoFetch<any>("/checkout/select-payment-method", {
    method: "POST",
    body: { cart_id, payment_method_id },
  });
  return normalizeCheckout(raw);
}

export async function checkoutComplete() {
  const cart_id = getStoredCartId();
  const raw = await sellqoFetch<any>("/checkout/complete", {
    method: "POST",
    body: { cart_id },
  });
  const state = normalizeCheckout(raw);
  const redirect_url: string | undefined =
    raw?.redirect_url ?? raw?.checkout?.redirect_url ?? raw?.payment_url;
  return { ...state, redirect_url };
}

export async function checkoutGetOrder() {
  const cart_id = getStoredCartId();
  if (!cart_id) throw new Error("No active cart");
  const raw = await sellqoFetch<any>("/checkout/order", {
    query: { cart_id },
  });
  return normalizeCheckout(raw);
}

export async function checkoutGetConfirmation(orderId: string) {
  const raw = await sellqoFetch<any>(`/checkout/confirmation/${orderId}`);
  return normalizeCheckout(raw);
}