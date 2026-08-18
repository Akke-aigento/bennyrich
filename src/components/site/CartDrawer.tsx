import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatEUR } from "@/lib/format";
import { colourFromLabel } from "@/lib/product-image";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, updateItem, removeItem } = useCart();

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close bag"
        onClick={closeCart}
        tabIndex={isOpen ? 0 : -1}
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "rgba(0,0,0,0.72)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l transition-transform duration-200"
        style={{
          background: "var(--br-black)",
          borderColor: "var(--br-blue)",
          boxShadow: isOpen
            ? "0 0 8px color-mix(in srgb, var(--br-blue) 60%, transparent)"
            : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <header
          className="flex items-center justify-between border-b px-6 py-5"
          style={{ borderColor: "var(--br-line)" }}
        >
          <h2 className="br-nav" style={{ color: "var(--br-white)" }}>
            Your bag ({items.length})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue)]"
            style={{ color: "var(--br-white)" }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="br-display text-[1.15rem]" style={{ color: "var(--br-white)" }}>
                Your bag is empty
              </p>
              <p className="mt-3 text-[13px]" style={{ color: "var(--br-mute)" }}>
                Built for people who stand out.
              </p>
              <Link to="/shop" onClick={closeCart} className="neon-btn mt-7">
                Shop now <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4">
                  <div
                    className="h-24 w-20 flex-shrink-0 overflow-hidden border"
                    style={{ background: "var(--br-ink)", borderColor: "var(--br-line)" }}
                  >
                    <ProductImage
                      apiUrl={it.image}
                      slug={it.slug}
                      colour={colourFromLabel(it.variant_label)}
                      alt={it.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="br-label truncate" style={{ color: "var(--br-white)" }}>
                          {it.name}
                        </p>
                        {it.variant_label && (
                          <p className="mt-1.5 text-[12px]" style={{ color: "var(--br-mute)" }}>
                            {it.variant_label}
                          </p>
                        )}
                      </div>
                      <span className="br-price text-[14px]" style={{ color: "var(--br-white)" }}>
                        {formatEUR(it.line_total ?? it.price * it.quantity)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div
                        className="inline-flex items-center border"
                        style={{ borderColor: "var(--br-line)" }}
                      >
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            it.quantity <= 1
                              ? removeItem(it.id)
                              : updateItem(it.id, it.quantity - 1)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue)]"
                          style={{ color: "var(--br-white)" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className="w-8 text-center text-[13px]"
                          style={{ color: "var(--br-white)" }}
                        >
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateItem(it.id, it.quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue)]"
                          style={{ color: "var(--br-white)" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="br-label text-[10px] underline underline-offset-4 transition-colors duration-200 hover:text-[var(--br-pink)]"
                        style={{ color: "var(--br-mute)" }}
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
          <footer className="border-t px-6 py-6" style={{ borderColor: "var(--br-line)" }}>
            <div className="flex items-baseline justify-between">
              <span className="br-nav text-[11px]" style={{ color: "var(--br-mute)" }}>
                Subtotal
              </span>
              <span className="br-price text-[1.15rem]" style={{ color: "var(--br-white)" }}>
                {formatEUR(subtotal)}
              </span>
            </div>
            <p className="mt-2 text-[12px]" style={{ color: "var(--br-mute)" }}>
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="neon-btn mt-5 w-full justify-center"
            >
              Checkout <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="br-label mt-4 w-full py-2 text-[10px] underline underline-offset-4 transition-colors duration-200 hover:text-[var(--br-white)]"
              style={{ color: "var(--br-mute)" }}
            >
              Continue shopping
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
