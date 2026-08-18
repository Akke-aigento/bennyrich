import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { checkoutGetConfirmation } from "@/lib/checkout";
import { formatEUR } from "@/lib/sellqo";

export const Route = createFileRoute("/checkout/confirmation/$orderId")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Zona Dorata" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { orderId } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["checkout", "confirmation", orderId],
    queryFn: () => checkoutGetConfirmation(orderId),
  });

  return (
    <div>
      <div className="text-center">
        <p className="ui-label text-[0.75rem]" style={{ color: "var(--gold)" }}>
          Grazie
        </p>
        <h2
          className="mt-2 text-[2rem]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Your order is confirmed
        </h2>
        <p className="mt-3 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Order reference · <span style={{ color: "var(--ink)" }}>{orderId}</span>
        </p>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Loading order details…
        </p>
      ) : error ? (
        <p className="mt-10 text-center text-[0.9rem]" style={{ color: "var(--destructive)" }}>
          {(error as Error).message}
        </p>
      ) : data ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {data.customer && (
            <Panel title="Contact">
              <p>{data.customer.email}</p>
              {data.customer.phone && <p>{data.customer.phone}</p>}
            </Panel>
          )}
          {data.shipping_address && (
            <Panel title="Shipping address">
              <AddressBlock a={data.shipping_address} />
            </Panel>
          )}
          <Panel title="Totals" className="md:col-span-2">
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
                <span className="ui-label text-[0.75rem]" style={{ color: "var(--ink)" }}>Total</span>
                <span className="text-[1.1rem]" style={{ color: "var(--ink)", fontWeight: 500 }}>
                  {formatEUR(data.total)}
                </span>
              </div>
            )}
          </Panel>
        </div>
      ) : null}

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="ui-label text-[0.75rem] px-6 py-3"
          style={{ border: "1px solid var(--ink)", color: "var(--ink)" }}
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function Panel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={"border p-5 space-y-1 text-[0.9rem] " + (className ?? "")}
      style={{ borderColor: "var(--line)", background: "var(--bone)" }}
    >
      <p className="ui-label text-[0.65rem] mb-2" style={{ color: "var(--muted-tone)" }}>
        {title}
      </p>
      <div style={{ color: "var(--ink)" }}>{children}</div>
    </div>
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

function AddressBlock({ a }: { a: any }) {
  return (
    <>
      <p>
        {[a.first_name, a.last_name].filter(Boolean).join(" ")}
      </p>
      <p>{a.address_line_1 ?? a.address1}</p>
      {(a.address_line_2 ?? a.address2) && <p>{a.address_line_2 ?? a.address2}</p>}
      <p>
        {[a.postal_code ?? a.zip, a.city].filter(Boolean).join(" ")}
      </p>
      <p>{a.country}</p>
    </>
  );
}