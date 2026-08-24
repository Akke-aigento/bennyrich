import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/site/RequireAuth";
import { VerifyGate } from "@/components/site/VerifyGate";
import { useOrder, useOrdersAllowed } from "@/lib/orders";
import {
  formatAddressLines,
  formatOrderDate,
  orderAmount,
  orderStatusLabel,
  paymentStatusLabel,
  type CustomerAddress,
  type CustomerOrderDetail,
  type CustomerOrderItem,
} from "@/lib/account";
import { formatEUR } from "@/lib/format";

export const Route = createFileRoute("/account/orders/$orderId")({
  head: () => ({
    meta: [{ title: "Order — BennyRich" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <RequireAuth>
      <OrderDetailPage />
    </RequireAuth>
  ),
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { verified, loading: authLoading } = useOrdersAllowed();
  const { order, isLoading, notVerified } = useOrder(orderId);
  const gated = !authLoading && (!verified || notVerified);

  return (
    <div className="br-shell br-section">
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        <Link to="/account" style={{ color: "var(--br-mute)" }}>
          Account
        </Link>{" "}
        /{" "}
        <Link to="/account/orders" style={{ color: "var(--br-mute)" }}>
          Orders
        </Link>{" "}
        / Detail
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(24px, 3.6vw, 38px)", letterSpacing: "0.06em" }}
      >
        {order?.order_number ? `Order ${order.order_number}` : "Order"}
      </h1>

      {authLoading || (!gated && isLoading) ? (
        <p className="mt-10 text-[14px]" style={{ color: "var(--br-mute)" }}>
          Loading this order…
        </p>
      ) : gated ? (
        <div className="mt-10">
          <VerifyGate />
        </div>
      ) : !order ? (
        <div className="mt-10">
          <p className="text-[15px]" style={{ color: "var(--br-white)", lineHeight: 1.8 }}>
            We could not find that order.
          </p>
          <Link to="/account/orders" className="neon-btn mt-7">
            Back to your orders <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <OrderBody order={order} />
      )}
    </div>
  );
}

function OrderBody({ order }: { order: CustomerOrderDetail }) {
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const shipping = asAddress(order.shipping_address);

  return (
    <div className="mt-10 flex flex-col gap-4">
      <div className="quiet-frame border p-7" style={{ borderRadius: "var(--radius)" }}>
        <p className="text-[13px]" style={{ color: "var(--br-mute)", lineHeight: 1.6 }}>
          {[formatOrderDate(order.created_at), orderStatusLabel(order), paymentStatusLabel(order)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {items.length > 0 && (
        <div className="quiet-frame border p-7" style={{ borderRadius: "var(--radius)" }}>
          <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
            Items
          </p>
          <ul className="mt-5 flex flex-col gap-4">
            {items.map((item, index) => (
              <li key={`${item.product_name ?? "item"}-${index}`}>
                <ItemRow item={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*
        Every figure below comes straight from the API. Nothing is added up
        here: a total the storefront computed could disagree with the invoice.
      */}
      <div className="quiet-frame border p-7" style={{ borderRadius: "var(--radius)" }}>
        <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
          Totals
        </p>
        <dl className="mt-5 flex flex-col gap-3">
          <Amount label="Subtotal" value={order.subtotal} />
          <Amount label="Shipping" value={order.shipping_cost} />
          <Amount label="VAT" value={order.tax_amount} />
          <Amount label="Total" value={order.total} strong />
        </dl>
      </div>

      {shipping && (
        <div className="quiet-frame border p-7" style={{ borderRadius: "var(--radius)" }}>
          <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
            Delivery address
          </p>
          <div className="mt-5 flex flex-col gap-1">
            {formatAddressLines(shipping).map((line) => (
              <p key={line} className="text-[14px]" style={{ color: "var(--br-white)" }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <Link to="/account/orders" className="neon-btn neon-btn-quiet mt-3 self-start">
        Back to your orders
      </Link>
    </div>
  );
}

function ItemRow({ item }: { item: CustomerOrderItem }) {
  const line = orderAmount(item.total);
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <p className="text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.6 }}>
        {item.product_name ?? "Item"}
        {item.quantity != null && (
          <span style={{ color: "var(--br-mute)" }}> × {item.quantity}</span>
        )}
      </p>
      {line !== null && (
        <p className="text-[14px]" style={{ color: "var(--br-white)" }}>
          {formatEUR(line)}
        </p>
      )}
    </div>
  );
}

function Amount({ label, value, strong }: { label: string; value: unknown; strong?: boolean }) {
  const amount = orderAmount(value);
  if (amount === null) return null;
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-[14px]" style={{ color: strong ? "var(--br-white)" : "var(--br-mute)" }}>
        {label}
      </dt>
      <dd className={strong ? "br-price" : "text-[14px]"} style={{ color: "var(--br-white)" }}>
        {formatEUR(amount)}
      </dd>
    </div>
  );
}

/** Core stores addresses as jsonb, so this may be an object, a string, or null. */
function asAddress(raw: unknown): CustomerAddress | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const address = raw as CustomerAddress;
  return formatAddressLines(address).length > 0 ? address : null;
}
