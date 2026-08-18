import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Monogram } from "@/assets/brand/Monogram";
import { Wordmark } from "@/assets/brand/Wordmark";
import { useCart } from "@/lib/cart-context";
import { CATEGORIES } from "@/lib/categories";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop", children: CATEGORIES },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // The header is flat black at rest; it only picks up a frosted ground once
  // content is passing underneath it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    setSearchOpen(false);
    navigate({ to: "/shop", search: q ? { q } : {} });
  }

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors duration-200"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--br-black) 82%, transparent)"
          : "var(--br-black)",
        backdropFilter: scrolled ? "blur(12px)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(12px)" : undefined,
        borderColor: "var(--br-line)",
      }}
    >
      <div className="br-shell grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: wordmark (desktop) / hamburger (mobile) */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="-ml-2 inline-flex h-11 w-11 items-center justify-center justify-self-start md:hidden"
          style={{ color: "var(--br-white)" }}
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <Link
          to="/"
          aria-label="BennyRich — home"
          className="hidden justify-self-start md:inline-flex"
        >
          <Wordmark tone="blue" layout="inline" size={18} />
        </Link>

        {/* Centre: nav (desktop) / monogram (mobile) */}
        <Link to="/" aria-label="BennyRich — home" className="justify-self-center md:hidden">
          <Monogram tone="blue" intensity="logotype" size={32} />
        </Link>
        <nav className="hidden justify-self-center md:flex md:items-center md:gap-7 lg:gap-9">
          {NAV.map((item) =>
            "children" in item && item.children ? (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <Link
                  to={item.to}
                  className="br-nav inline-flex items-center gap-1 transition-colors duration-200"
                  style={{ color: "var(--br-white)" }}
                  activeProps={{
                    className: "br-nav neon-text-blue inline-flex items-center gap-1",
                  }}
                  aria-haspopup="true"
                  aria-expanded={shopOpen}
                  onFocus={() => setShopOpen(true)}
                >
                  {item.label}
                  <ChevronDown size={13} strokeWidth={1.5} aria-hidden />
                </Link>
                {shopOpen && (
                  <div
                    className="absolute left-1/2 top-full min-w-[210px] -translate-x-1/2 border pt-4"
                    style={{ borderColor: "transparent" }}
                  >
                    <ul
                      className="border py-2"
                      style={{
                        background: "var(--br-ink)",
                        borderColor: "var(--br-line)",
                      }}
                    >
                      {item.children.map((c) => (
                        <li key={c.slug}>
                          <Link
                            to="/shop"
                            search={{ category: c.slug }}
                            className="br-nav block px-5 py-3 transition-colors duration-200 hover:text-[var(--br-blue)]"
                            style={{ color: "var(--br-white)" }}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className="br-nav transition-colors duration-200"
                style={{ color: "var(--br-white)" }}
                activeProps={{ className: "br-nav neon-text-blue" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right: search, account, bag */}
        <div className="flex items-center gap-1 justify-self-end sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="hidden h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue)] sm:inline-flex"
            style={{ color: "var(--br-white)" }}
          >
            <Search size={19} strokeWidth={1.5} />
          </button>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Account"
              aria-expanded={accountOpen}
              className="inline-flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue)]"
              style={{ color: "var(--br-white)" }}
            >
              <User size={19} strokeWidth={1.5} />
            </button>
            {accountOpen && (
              <div
                className="absolute right-0 top-full w-[230px] border p-4"
                style={{ background: "var(--br-ink)", borderColor: "var(--br-line)" }}
              >
                <p className="br-label" style={{ color: "var(--br-white)" }}>
                  Accounts coming soon
                </p>
                <p className="mt-2 text-[12px]" style={{ color: "var(--br-mute)" }}>
                  You can check out as a guest today.
                </p>
                <Link
                  to="/contact"
                  className="br-label mt-3 inline-block transition-colors duration-200 hover:text-[var(--br-blue)]"
                  style={{ color: "var(--br-blue)" }}
                >
                  Need help? →
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue)]"
            style={{ color: "var(--br-white)" }}
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span
              className="absolute right-1 top-1.5 inline-flex h-[17px] min-w-[17px] items-center justify-center px-[3px] text-[10px] font-medium"
              style={{
                background: "var(--br-pink)",
                color: "var(--br-black)",
                borderRadius: "2px",
                boxShadow:
                  "0 0 var(--glow-logo-halo) color-mix(in srgb, var(--br-pink) var(--glow-line-alpha), transparent)",
              }}
            >
              {count}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop search bar */}
      {searchOpen && (
        <div className="border-t" style={{ borderColor: "var(--br-line)" }}>
          <form onSubmit={submitSearch} className="br-shell flex items-center gap-3 py-4">
            <Search size={18} strokeWidth={1.5} style={{ color: "var(--br-mute)" }} aria-hidden />
            <input
              ref={searchRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search the store"
              aria-label="Search the store"
              className="br-input flex-1"
              style={{ background: "transparent", border: "none" }}
            />
            <button type="submit" className="neon-btn" style={{ padding: "0.6rem 1.1rem" }}>
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col md:hidden"
          style={{ background: "var(--br-black)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className="br-shell flex h-[72px] shrink-0 items-center justify-between border-b"
            style={{ borderColor: "var(--br-line)" }}
          >
            <Monogram tone="blue" intensity="logotype" size={32} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center"
              style={{ color: "var(--br-white)" }}
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="br-shell flex flex-1 flex-col gap-1 py-10">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="br-nav py-4 text-[15px]"
                style={{ color: "var(--br-white)" }}
                activeProps={{ className: "br-nav neon-text-blue py-4 text-[15px]" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--br-line)" }}>
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/shop"
                  search={{ category: c.slug }}
                  className="br-label block py-3"
                  style={{ color: "var(--br-mute)" }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
