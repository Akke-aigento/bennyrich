/**
 * Order history, gated on a verified email address.
 *
 * Two gates, on purpose. The client one keeps an unverified customer from
 * firing a request that is going to be refused anyway, and lets the page show
 * the real reason instead of an error. The server one is core's: get_orders and
 * get_order answer 403 EMAIL_NOT_VERIFIED regardless of what the client
 * believes, because orders are matched on customer_email and an unverified
 * address is not proof of anything.
 *
 * The proxy translates that 403 into an EMAIL_NOT_VERIFIED error rather than
 * clearing the session — see the customer branch in sellqo.functions.ts. If the
 * two gates ever disagree, `notVerified` below catches it and the page shows the
 * same message it would have shown anyway.
 */
import { useQuery } from "@tanstack/react-query";
import { sellqoFetch } from "./sellqo";
import { useAuth } from "./auth";
import { unwrapOrder, unwrapOrders, type CustomerOrder, type CustomerOrderDetail } from "./account";

export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";

export function isNotVerifiedError(error: unknown): boolean {
  return error instanceof Error && error.message === EMAIL_NOT_VERIFIED;
}

/** True once we know the customer is signed in AND confirmed. */
export function useOrdersAllowed(): { allowed: boolean; loading: boolean; verified: boolean } {
  const { customer, status } = useAuth();
  return {
    allowed: status === "authed" && customer?.email_verified === true,
    loading: status === "loading",
    verified: customer?.email_verified === true,
  };
}

export function useOrders() {
  const { customer } = useAuth();
  const { allowed, loading } = useOrdersAllowed();

  const query = useQuery({
    queryKey: ["customer", "orders", customer?.id ?? "none"],
    queryFn: () => sellqoFetch("/account/orders"),
    enabled: allowed,
    staleTime: 30_000,
    // A refused gate is not a transient failure; retrying just delays the
    // message the customer needs to read.
    retry: (count, error) => !isNotVerifiedError(error) && count < 2,
  });

  return {
    orders: unwrapOrders(query.data) as CustomerOrder[],
    isLoading: loading || (allowed && query.isLoading),
    notVerified: isNotVerifiedError(query.error),
    error: query.error,
  };
}

export function useOrder(orderId: string) {
  const { customer } = useAuth();
  const { allowed, loading } = useOrdersAllowed();

  const query = useQuery({
    queryKey: ["customer", "order", customer?.id ?? "none", orderId],
    queryFn: () => sellqoFetch(`/account/orders/${orderId}`),
    enabled: allowed && Boolean(orderId),
    staleTime: 30_000,
    retry: (count, error) => !isNotVerifiedError(error) && count < 2,
  });

  return {
    order: unwrapOrder(query.data) as CustomerOrderDetail | null,
    isLoading: loading || (allowed && query.isLoading),
    notVerified: isNotVerifiedError(query.error),
    error: query.error,
  };
}
