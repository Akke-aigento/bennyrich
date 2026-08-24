import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart-context";
import { useCartVariantLabels } from "@/lib/cart-labels";
import { ProductImage } from "@/components/site/ProductImage";
import { formatEUR } from "@/lib/format";
import { colourFromLabel } from "@/lib/product-image";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — BennyRich" },
      { name: "description", content: "Complete your BennyRich order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutLayout,
});

const STEPS = [
  { key: "details", label: "Details", path: "/checkout" },
  { key: "payment", label: "Payment", path: "/checkout/payment" },
] as const;

function CheckoutLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isConfirmation = pathname.startsWith("/checkout/confirmation");
  const activeIdx = isConfirmation
    ? STEPS.length
    : Math.max(
        0,
        STEPS.findIndex((s) =>
          s.path === "/checkout" ? pathname === "/checkout" : pathname.startsWith(s.path),
        ),
      );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1200px] px-4 pt-8 md:px-6 md:pt-12">
        <Link
          to="/"
          className="ui-label text-[0.7rem]"
          style={{ color: "var(--muted-tone)" }}
        >
          ← Continue shopping
        </Link>
        <h1
          className="mt-4 text-[2rem] md:text-[2.5rem]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Checkout
        </h1>

        {!isConfirmation && (
          <ol className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center text-[0.75rem]"
                  style={{
                    border: `1px solid ${i <= activeIdx ? "var(--ink)" : "var(--line)"}`,
                    background: i < activeIdx ? "var(--ink)" : "transparent",
                    color: i < activeIdx ? "var(--paper)" : i === activeIdx ? "var(--ink)" : "var(--muted-tone)",
                    borderRadius: "999px",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="ui-label text-[0.7rem]"
                  style={{ color: i === activeIdx ? "var(--ink)" : "var(--muted-tone)" }}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span aria-hidden style={{ color: "var(--line)" }}>—</span>
                )}
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 grid gap-10 pb-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
          <div className="min-w-0">
            <Outlet />
          </div>
          {!isConfirmation && <OrderSummary />}
        </div>
      </div>
    </SiteLayout>
  );
}

function OrderSummary() {
  const { items, subtotal, count, hydrated } = useCart();
  // Same resolver the bag uses, so the two can never disagree about which
  // variant was ordered. See lib/cart-labels.ts.
  const labels = useCartVariantLabels(items);
  return (
    <aside
      className="h-fit border p-6 lg:sticky lg:top-24"
      style={{ borderColor: "var(--line)", background: "var(--br-ink)" }}
    >
      <h2
        className="ui-label text-[0.7rem]"
        style={{ color: "var(--muted-tone)" }}
      >
        Order Summary ({count})
      </h2>
      {!hydrated ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Loading your bag…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Your bag is empty.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-4">
            {items.map((it) => (
              <li key={it.id} className="flex gap-3">
                {/* Square .br-media well and a hairline, matching the bag: the
                    thumbnail used to object-cover, which cropped, and carried no
                    border while the drawer's did. ProductImage also brings the
                    local fallback walk the raw <img> here never had. */}
                {/* The badge is a SIBLING of the well, not a child: .br-media is
                    overflow:hidden, so a badge nudged to -top-1/-right-1 inside it
                    was being clipped. */}
                <div className="relative flex-shrink-0">
                  <div
                    className="br-media h-16 w-16 border"
                    style={{ borderColor: "var(--br-line)", borderRadius: "var(--radius)" }}
                  >
                    <ProductImage
                      apiUrl={it.image}
                      slug={it.slug}
                      colour={colourFromLabel(labels.get(it.id))}
                      alt={it.name}
                    />
                  </div>
                  <span
                    className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center px-1 text-[0.65rem]"
                    style={{
                      background: "var(--br-white)",
                      color: "var(--br-black)",
                      borderRadius: "999px",
                    }}
                  >
                    {it.quantity}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className="truncate text-[0.85rem]"
                      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                    >
                      {it.name}
                    </p>
                    {labels.get(it.id) && (
                      <p className="text-[0.7rem]" style={{ color: "var(--muted-tone)" }}>
                        {labels.get(it.id)}
                      </p>
                    )}
                  </div>
                  <span className="text-[0.85rem]" style={{ color: "var(--ink)" }}>
                    {it.line_total != null ? formatEUR(it.line_total) : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div
            className="mt-6 border-t pt-4 flex items-baseline justify-between"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="ui-label text-[0.7rem]" style={{ color: "var(--muted-tone)" }}>
              Subtotal
            </span>
            <span className="text-[1rem]" style={{ color: "var(--ink)", fontWeight: 500 }}>
              {formatEUR(subtotal)}
            </span>
          </div>
          <p className="mt-1 text-[0.7rem]" style={{ color: "var(--muted-tone)" }}>
            Shipping and taxes at final step.
          </p>
        </>
      )}
    </aside>
  );
}