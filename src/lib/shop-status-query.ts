import { queryOptions } from "@tanstack/react-query";

import { sellqoFetch } from "./sellqo";
import { resolveShopOpen, SHOP_STATUS_CACHE_MS } from "./shop-status";

/** Fetched in the root loader so it covers every route; cached at most 30s. */
export const shopStatusQueryOptions = queryOptions({
  queryKey: ["sellqo", "shop-status"],
  queryFn: async () => ({
    open: await resolveShopOpen(() => sellqoFetch("/get_shop_status", { method: "POST" })),
  }),
  staleTime: SHOP_STATUS_CACHE_MS,
  retry: false,
});
