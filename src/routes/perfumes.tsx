import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Compatibility shim, not a real page.
 *
 * `EmptyCartRedirect` in src/components/site/CheckoutForm.tsx sends shoppers
 * with an empty bag to `/perfumes` — a leftover from the storefront this one
 * was remixed from. That file is frozen for this batch, so rather than edit it
 * we keep the path alive and bounce it to /shop. Delete this file once
 * CheckoutForm is allowed to change — see docs/role-audit.md.
 */
export const Route = createFileRoute("/perfumes")({
  beforeLoad: () => {
    throw redirect({ to: "/shop" });
  },
});
