import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart-context";
import {
  checkoutComplete,
  checkoutGetOrder,
  checkoutSelectPayment,
  checkoutSetShipping,
  type PaymentMethod,
  type ShippingMethod,
} from "@/lib/checkout";
import { formatEUR } from "@/lib/format";
import { EmptyCartRedirect, PrimaryButton } from "@/components/site/CheckoutForm";

export const Route = createFileRoute("/checkout/payment")({
  head: () => ({
    meta: [{ title: "Checkout · Payment — BennyRich" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentStep,
});

function PaymentStep() {
  const navigate = useNavigate();
  const { count, hydrated, resetLocal } = useCart();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["checkout", "order"],
    queryFn: () => checkoutGetOrder(),
    enabled: hydrated && count > 0,
  });
  const [shipId, setShipId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [shipPending, setShipPending] = useState(false);
  // Monotonic ticket per shipping selection. A slower earlier response must not
  // overwrite the summary with a method the shopper has already moved on from.
  const shipSeq = useRef(0);

  /**
   * Push the chosen shipping method as soon as it is picked, then refetch, so
   * the order summary shows that method's cost immediately. Until BR-8 this was
   * deferred to submit, which meant the total said "Free" right up to the
   * moment the order was placed.
   *
   * `checkoutSetShipping` is the existing function from lib/checkout.ts — only
   * WHEN it runs has changed. The submit path still calls it as a safety net if
   * this ever failed.
   */
  async function selectShipping(methodId: string) {
    if (methodId === shipId) return;
    const ticket = ++shipSeq.current;
    setShipId(methodId);
    setShipPending(true);
    setServerErr(null);
    try {
      await checkoutSetShipping(methodId);
      if (ticket !== shipSeq.current) return; // superseded by a newer choice
      await refetch();
    } catch (err: unknown) {
      if (ticket !== shipSeq.current) return;
      setServerErr(err instanceof Error ? err.message : "Could not update shipping");
    } finally {
      if (ticket === shipSeq.current) setShipPending(false);
    }
  }

  useEffect(() => {
    if (!data) return;
    if (!shipId) {
      setShipId(data.selected_shipping_method_id ?? data.shipping_methods?.[0]?.id ?? null);
    }
    if (!payId) {
      setPayId(data.selected_payment_method_id ?? data.payment_methods?.[0]?.id ?? null);
    }
  }, [data, shipId, payId]);

  if (!hydrated || count === 0) return <EmptyCartRedirect />;

  const shipMethods: ShippingMethod[] = data?.shipping_methods ?? [];
  const payMethods: PaymentMethod[] = data?.payment_methods ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shipId || !payId || !terms) return;
    setBusy(true);
    setServerErr(null);
    try {
      if (shipId !== data?.selected_shipping_method_id) {
        await checkoutSetShipping(shipId);
      }
      await checkoutSelectPayment(payId);
      const result = await checkoutComplete();
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }
      const orderId = result.order_id;
      resetLocal();
      if (orderId) {
        navigate({ to: "/checkout/confirmation/$orderId", params: { orderId } });
      } else {
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setServerErr(err?.message ?? "Payment failed");
      refetch();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <Link
          to="/checkout"
          className="ui-label text-[0.7rem]"
          style={{ color: "var(--muted-tone)" }}
        >
          ← Back to details
        </Link>
      </div>

      <h2
        className="text-[1.4rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Shipping method
      </h2>
      {isLoading ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Loading…
        </p>
      ) : error ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--destructive)" }}>
          {(error as Error).message}
        </p>
      ) : shipMethods.length === 0 ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          No shipping options available for your address.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shipMethods.map((m) => {
            const active = shipId === m.id;
            return (
              <li key={m.id}>
                <label
                  className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors"
                  style={{
                    border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                    background: active ? "var(--br-ink)" : "transparent",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={active}
                      onChange={() => selectShipping(m.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-[0.95rem]" style={{ color: "var(--ink)" }}>
                        {m.name}
                      </p>
                      {(m.description || m.estimated_delivery) && (
                        <p className="mt-1 text-[0.75rem]" style={{ color: "var(--muted-tone)" }}>
                          {m.description}
                          {m.description && m.estimated_delivery ? " · " : ""}
                          {m.estimated_delivery}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[0.95rem]" style={{ color: "var(--ink)" }}>
                    {m.price === 0 ? "Free" : formatEUR(m.price)}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <h2
        className="mt-10 text-[1.4rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Payment method
      </h2>
      {isLoading ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Loading…
        </p>
      ) : payMethods.length === 0 ? (
        <p className="mt-4 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          No payment options available. Please contact us.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {payMethods.map((m) => {
            const active = payId === m.id;
            return (
              <li key={m.id}>
                <label
                  className="flex cursor-pointer items-start gap-3 p-4 transition-colors"
                  style={{
                    border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                    background: active ? "var(--br-ink)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={active}
                    onChange={() => setPayId(m.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="text-[0.95rem]" style={{ color: "var(--ink)" }}>
                      {m.name}
                    </p>
                    {m.description && (
                      <p className="mt-1 text-[0.75rem]" style={{ color: "var(--muted-tone)" }}>
                        {m.description}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {data && (
        <div
          className="mt-8 space-y-1 border-t pt-4 text-[0.9rem] transition-opacity duration-200"
          style={{ borderColor: "var(--line)", opacity: shipPending ? 0.55 : 1 }}
          aria-busy={shipPending}
        >
          {data.subtotal != null && <Row label="Subtotal" value={formatEUR(data.subtotal)} />}
          {data.shipping_total != null && (
            <Row
              label="Shipping"
              value={data.shipping_total === 0 ? "Free" : formatEUR(data.shipping_total)}
            />
          )}
          {data.tax_total != null && data.tax_total > 0 && (
            <Row label="Tax" value={formatEUR(data.tax_total)} />
          )}
          {data.total != null && (
            <div
              className="mt-2 flex items-baseline justify-between pt-2 border-t"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="ui-label text-[0.75rem]" style={{ color: "var(--ink)" }}>
                Total
              </span>
              <span className="text-[1.1rem]" style={{ color: "var(--ink)", fontWeight: 500 }}>
                {formatEUR(data.total)}
              </span>
            </div>
          )}
        </div>
      )}

      <label className="mt-6 flex items-start gap-3 text-[0.85rem]" style={{ color: "var(--ink)" }}>
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-1"
        />
        I agree to the terms of sale and privacy policy.
      </label>

      {serverErr && (
        <p className="mt-4 text-[0.85rem]" style={{ color: "var(--destructive)" }}>
          {serverErr}
        </p>
      )}
      <PrimaryButton disabled={busy || shipPending || !shipId || !payId || !terms}>
        {busy ? "Processing…" : shipPending ? "Updating…" : "Complete order"}
      </PrimaryButton>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span style={{ color: "var(--muted-tone)" }}>{label}</span>
      <span style={{ color: "var(--ink)" }}>{value}</span>
    </div>
  );
}
