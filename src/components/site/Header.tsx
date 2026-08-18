import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import logoBlack from "@/assets/brand/logo-black.svg";
import { useCart } from "@/lib/cart-context";

const navItems = [
  { to: "/perfumes", label: "Perfumes" },
  { to: "/jewellery", label: "Jewellery" },
  { to: "/artworks", label: "Artworks" },
  { to: "/designer-clothes", label: "Clothes" },
  { to: "/selfcare", label: "Selfcare" },
];

export function Header() {
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div className="section-shell grid h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-4 md:flex md:justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center justify-self-start -ml-2"
          style={{ color: "var(--ink)" }}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <Link
          to="/"
          aria-label="Zona Dorata"
          className="flex items-center justify-self-center md:justify-self-start"
        >
          <img
            src={logoBlack}
            alt="Zona Dorata"
            className="h-[28px] w-auto md:h-[32px]"
          />
        </Link>
        <nav className="hidden gap-6 md:flex lg:gap-8">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="ui-label text-[0.7rem]"
              style={{ color: "var(--ink)" }}
              activeProps={{ style: { color: "var(--gold)" } }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={openCart}
          className="ui-label text-[0.7rem] justify-self-end whitespace-nowrap"
          style={{ color: "var(--ink)" }}
          aria-label={`Open bag, ${count} items`}
        >
          Bag ({count})
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[64px] z-30 md:hidden"
            style={{ background: "rgba(20,16,11,0.4)" }}
          />
          <nav
            className="fixed left-0 right-0 top-[64px] z-40 border-b md:hidden"
            style={{ background: "var(--paper)", borderColor: "var(--line)" }}
          >
            <ul className="section-shell flex flex-col py-4">
              {navItems.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="ui-label block py-3 text-[0.8rem]"
                    style={{ color: "var(--ink)" }}
                    activeProps={{ style: { color: "var(--gold)" } }}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}