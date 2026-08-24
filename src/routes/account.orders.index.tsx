import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/site/RequireAuth";
import { VerifyGate } from "@/components/site/VerifyGate";
import { useOrders, useOrdersAllowed } from "@/lib/orders";
import {
  formatOrderDate,
  orderAmount,
  orderStatusLabel,
  paymentStatusLabel,
  type CustomerOrder,
} from "@/lib/account";
import { formatEUR } from "@/lib/format";

export const Route = createFileRoute("/account/orders/")({
  head: () => ({
    meta: [{ title: "Your orders — BennyRich" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <RequireAuth>
      <OrdersPage />
    </RequireAuth>
  ),
});

function OrdersPage() {
  const { verified, loading: authLoading } = useOrdersAllowed();
  const { orders, isLoading, notVerified } = useOrders();

  // Either gate reaching the same conclusion shows the same thing: the one we
  // knew about up front, and the one core enforced anyway.
  const gated = !authLoading && (!verified || notVerified);

  return (
    <div className="br-shell br-section">
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        <Link to="/account" style={{ color: "var(--br-mute)" }}>
          Account
        </Link>{" "}
        / Orders
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        Orders
      </h1>

      {authLoading || (!gated && isLoading) ? (
        <p className="mt-10 text-[14px]" style={{ color: "var(--br-mute)" }}>
          Loading your orders…
        </p>
      ) : gated ? (
        <div className="mt-10">
          <VerifyGate />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10">
          <p className="text-[15px]" style={{ color: "var(--br-white)", lineHeight: 1.8 }}>
            No orders yet.
          </p>
          <p
            className="mt-3 max-w-[46ch] text-[14px]"
            style={{ color: "var(--br-mute)", lineHeight: 1.75 }}
          >
            When you place one, it appears here with its status and everything you ordered.
          </p>
          <Link to="/shop" className="neon-btn mt-7">
            Start shopping <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {orders.map((order) => (
            <li key={String(order.id ?? order.order_number)}>
              <OrderRow order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: CustomerOrder }) {
  const total = orderAmount(order.total);
  const date = formatOrderDate(order.created_at);
  const status = orderStatusLabel(order);
  const payment = paymentStatusLabel(order);
  const id = order.id ? String(order.id) : undefined;

  const body = (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="br-label" style={{ color: "var(--br-white)" }}>
          {order.order_number ? `Order ${order.order_number}` : "Order"}
        </p>
        {total !== null && (
          <p className="br-price" style={{ color: "var(--br-white)" }}>
            {formatEUR(total)}
          </p>
        )}
      </div>
      <p className="mt-3 text-[13px]" style={{ color: "var(--br-mute)", lineHeight: 1.6 }}>
        {[date, status, payment].filter(Boolean).join(" · ")}
      </p>
    </>
  );

  // An order with no id cannot be opened; showing a dead link would be worse
  // than showing the summary on its own.
  if (!id) {
    return (
      <div className="quiet-frame border p-7" style={{ borderRadius: "var(--radius)" }}>
        {body}
      </div>
    );
  }

  return (
    <Link
      to="/account/orders/$orderId"
      params={{ orderId: id }}
      className="quiet-frame hover:neon-line-blue br-lift block border p-7"
      style={{ borderRadius: "var(--radius)" }}
    >
      {body}
      <span
        className="br-label mt-5 block underline underline-offset-4"
        style={{ color: "var(--br-blue-text)" }}
      >
        View order
      </span>
    </Link>
  );
}
