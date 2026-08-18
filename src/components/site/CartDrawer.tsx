import { Link } from "@tanstack/react-router";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatEUR } from "@/lib/sellqo";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, updateItem, removeItem } = useCart();

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="fixed inset-0 z-40 transition-opacity"
        style={{
          background: "rgba(20,16,11,0.55)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col shadow-xl transition-transform duration-300"
        style={{
          background: "var(--paper)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <header
          className="flex items-center justify-between border-b px-6 py-5"
          style={{ borderColor: "var(--line)" }}
        >
          <h2
            className="ui-label text-[0.75rem]"
            style={{ color: "var(--ink)", letterSpacing: "var(--tracking-ui)" }}
          >
            Your Bag ({items.length})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close"
            className="h-10 w-10 -mr-2 inline-flex items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p
                className="text-[1.25rem]"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                Your bag is empty
              </p>
              <p className="mt-2 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
                Discover the No Rules collection.
              </p>
              <Link
                to="/perfumes"
                onClick={closeCart}
                className="mt-6 ui-label text-[0.7rem] px-6 py-3"
                style={{ border: "1px solid var(--ink)", color: "var(--ink)" }}
              >
                Shop Perfumes
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4">
                  <div
                    className="h-24 w-20 flex-shrink-0 overflow-hidden"
                    style={{ background: "var(--bone)" }}
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[0.9rem]"
                        style={{ color: "var(--muted-tone)", fontFamily: "var(--font-display)" }}
                      >
                        {it.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="truncate text-[0.95rem]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                        >
                          {it.name}
                        </p>
                        {it.variant_label && (
                          <p
                            className="mt-1 text-[0.75rem]"
                            style={{ color: "var(--muted-tone)" }}
                          >
                            {it.variant_label}
                          </p>
                        )}
                      </div>
                      <span className="text-[0.9rem]" style={{ color: "var(--ink)" }}>
                        {formatEUR(it.line_total ?? it.price * it.quantity)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className="inline-flex items-center"
                        style={{ border: "1px solid var(--line)" }}
                      >
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            it.quantity <= 1 ? removeItem(it.id) : updateItem(it.id, it.quantity - 1)
                          }
                          className="h-8 w-8 inline-flex items-center justify-center"
                          style={{ color: "var(--ink)" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className="w-8 text-center text-[0.85rem]"
                          style={{ color: "var(--ink)" }}
                        >
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateItem(it.id, it.quantity + 1)}
                          className="h-8 w-8 inline-flex items-center justify-center"
                          style={{ color: "var(--ink)" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="ui-label text-[0.65rem] underline underline-offset-4"
                        style={{ color: "var(--muted-tone)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer
            className="border-t px-6 py-6"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-baseline justify-between">
              <span
                className="ui-label text-[0.7rem]"
                style={{ color: "var(--muted-tone)" }}
              >
                Subtotal
              </span>
              <span className="text-[1.1rem]" style={{ color: "var(--ink)", fontWeight: 500 }}>
                {formatEUR(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[0.75rem]" style={{ color: "var(--muted-tone)" }}>
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="mt-5 ui-label block w-full py-4 text-center text-[0.8rem]"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full ui-label text-[0.7rem] py-2 underline underline-offset-4"
              style={{ color: "var(--muted-tone)" }}
            >
              Continue shopping
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}