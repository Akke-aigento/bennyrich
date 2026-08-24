/**
 * Wishlist state, shared by every heart on the page.
 *
 * A grid can render twenty cards; each one needs to know whether its product is
 * saved. That is ONE query, cached and keyed to the customer — not one per
 * card. Guests never fetch at all: there is nothing to fetch, and asking would
 * just be a guaranteed 401.
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sellqoFetch } from "./sellqo";
import { useAuth } from "./auth";
import { unwrapWishlist, type WishlistEntry } from "./account";

/** The product id an entry refers to, across the shapes the API might use. */
export function entryProductId(entry: WishlistEntry): string | undefined {
  const product = entry.product as { id?: string } | undefined;
  const raw = entry.product_id ?? product?.id ?? entry.id;
  return raw == null ? undefined : String(raw);
}

export function useWishlist() {
  const { customer, status } = useAuth();
  const queryClient = useQueryClient();
  const enabled = status === "authed" && Boolean(customer);
  const queryKey = ["customer", "wishlist", customer?.id ?? "none"];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => sellqoFetch("/wishlist"),
    enabled,
    staleTime: 60_000,
  });

  const entries = unwrapWishlist(data);
  const ids = new Set(entries.map(entryProductId).filter(Boolean) as string[]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const add = useMutation({
    mutationFn: (productId: string) =>
      sellqoFetch("/wishlist", { method: "POST", body: { product_id: productId } }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (productId: string) => sellqoFetch(`/wishlist/${productId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const has = useCallback((productId: string) => ids.has(String(productId)), [ids]);

  const toggle = useCallback(
    (productId: string) => {
      const id = String(productId);
      if (ids.has(id)) return remove.mutateAsync(id);
      return add.mutateAsync(id);
    },
    [ids, add, remove],
  );

  return {
    entries,
    ids,
    has,
    toggle,
    addItem: add.mutateAsync,
    removeItem: remove.mutateAsync,
    isLoading: enabled && isLoading,
    isPending: add.isPending || remove.isPending,
    enabled,
  };
}
