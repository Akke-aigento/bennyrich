import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Wordmark } from "@/assets/brand/Wordmark";
import { useCart } from "@/lib/cart-context";
import { customerName, useAuth } from "@/lib/auth";
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
  const { customer, status, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
    setMobileShopOpen(false);
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

  // Collapsed by default, and re-collapsed each time the menu is opened.
  useEffect(() => {
    if (!menuOpen) setMobileShopOpen(false);
  }, [menuOpen]);

  // The desktop dropdown opens on hover AND on click, so it needs the two ways
  // out a click-opened menu is expected to have: Escape and a click elsewhere.
  // `pointerdown` rather than `click` so it closes before the page reacts.
  useEffect(() => {
    if (!shopOpen || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShopOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!shopRef.current?.contains(e.target as Node)) setShopOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [shopOpen]);

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

  /**
   * The mobile menu is portalled to <body>, and it has to be.
   *
   * It used to be a `fixed inset-0` child of this <header>. Once the page
   * scrolls past 8px the header takes `backdrop-filter: blur(12px)`, and any
   * backdrop-filter other than `none` makes an element a CONTAINING BLOCK for
   * its fixed descendants. `inset-0` then resolved against the 72px header box
   * instead of the viewport: the menu measured 390x72, its black ground covered
   * only the bar, and the links spilled down over the page with nothing behind
   * them. Measured before the fix — getBoundingClientRect() returned exactly the
   * header's rect. That is the "transparent menu" reported on v1.
   *
   * Client-only is safe: this only renders after a tap, so `document` exists.
   * Never nest a fixed overlay inside the header again.
   */
  const mobileMenu =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
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
              <Wordmark tone="blue" layout="inline" className="h-7 w-auto max-w-[52vw]" />
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
              {/* "Shop" in the list above goes straight to /shop; this is the
                  way into a single collection without leaving the menu first.
                  Opacity only, no height animation — nothing on this site
                  animates a box open. */}
              <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--br-line)" }}>
                <button
                  type="button"
                  onClick={() => setMobileShopOpen((v) => !v)}
                  aria-expanded={mobileShopOpen}
                  aria-controls="mobile-shop-list"
                  className="br-nav flex w-full items-center justify-between py-3 text-[15px]"
                  style={{ color: "var(--br-white)" }}
                >
                  Shop
                  <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    aria-hidden
                    className="transition-transform duration-200"
                    style={{ transform: mobileShopOpen ? "rotate(180deg)" : undefined }}
                  />
                </button>
                {mobileShopOpen && (
                  <div id="mobile-shop-list" className="pb-2 pl-1">
                    <Link
                      to="/shop"
                      className="br-label block py-3"
                      style={{ color: "var(--br-white)" }}
                    >
                      All products
                    </Link>
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
                )}
              </div>

              {/* The account icon is `hidden sm:block`, so without this there is
                  no way into an account from a phone. */}
              <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--br-line)" }}>
                {status === "authed" ? (
                  <>
                    <Link
                      to="/account"
                      className="br-nav block py-3 text-[15px]"
                      style={{ color: "var(--br-blue-text)" }}
                    >
                      Your account
                    </Link>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="br-label block py-3"
                      style={{ color: "var(--br-mute)" }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/account/login"
                    className="br-nav block py-3 text-[15px]"
                    style={{ color: "var(--br-blue-text)" }}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors duration-200"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--br-black) 82%, transparent)"
          : "var(--br-black)",
        // Must never be set while the mobile menu is open: `backdrop-filter`
        // (any value but `none`) makes an element a containing block for its
        // fixed descendants — see the comment on `mobileMenu` below. The portal
        // is the real fix; this is the second lock on the same door.
        backdropFilter: scrolled && !menuOpen ? "blur(12px)" : undefined,
        WebkitBackdropFilter: scrolled && !menuOpen ? "blur(12px)" : undefined,
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
          <Wordmark tone="blue" layout="inline" className="h-7 w-auto" />
        </Link>

        {/* Centre: nav (desktop) / monogram (mobile) */}
        {/* The written-out wordmark, not the ring: on a phone the centre slot is
            the only brand mark on screen, and a BR monogram alone does not say
            whose shop this is. Capped at 52vw so it cannot crowd the hamburger
            or the bag on a narrow device. */}
        <Link to="/" aria-label="BennyRich — home" className="justify-self-center md:hidden">
          <Wordmark tone="blue" layout="inline" className="h-7 w-auto max-w-[52vw]" />
        </Link>
        <nav className="hidden justify-self-center md:flex md:items-center md:gap-7 lg:gap-9">
          {NAV.map((item) =>
            "children" in item && item.children ? (
              <div
                key={item.to}
                ref={shopRef}
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                {/* The label keeps navigating to /shop; the chevron is a real
                    toggle, so the dropdown is reachable by click and by keyboard
                    and not only by hovering. "All products" below is the same
                    destination as the label, one row into the open menu. */}
                <span className="inline-flex items-center gap-1">
                  <Link
                    to={item.to}
                    className="br-nav transition-colors duration-200"
                    style={{ color: "var(--br-white)" }}
                    activeProps={{ className: "br-nav neon-text-blue-sm" }}
                    onFocus={() => setShopOpen(true)}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShopOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={shopOpen}
                    aria-label={shopOpen ? "Close shop menu" : "Open shop menu"}
                    className="-m-1 inline-flex items-center p-1 transition-colors duration-200"
                    style={{ color: "var(--br-white)" }}
                  >
                    <ChevronDown
                      size={13}
                      strokeWidth={1.5}
                      aria-hidden
                      className="transition-transform duration-200"
                      style={{ transform: shopOpen ? "rotate(180deg)" : undefined }}
                    />
                  </button>
                </span>
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
                      <li>
                        <Link
                          to="/shop"
                          className="br-nav block px-5 py-3 transition-colors duration-200 hover:text-[var(--br-blue-text)]"
                          style={{ color: "var(--br-white)" }}
                        >
                          All products
                        </Link>
                      </li>
                      {item.children.map((c) => (
                        <li key={c.slug}>
                          <Link
                            to="/shop"
                            search={{ category: c.slug }}
                            className="br-nav block px-5 py-3 transition-colors duration-200 hover:text-[var(--br-blue-text)]"
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
                activeProps={{ className: "br-nav neon-text-blue-sm" }}
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
            className="hidden h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue-text)] sm:inline-flex"
            style={{ color: "var(--br-white)" }}
          >
            <Search size={19} strokeWidth={1.5} />
          </button>

          <div className="relative hidden sm:block">
            {/* Signed out, the icon is just a link to sign in — no menu to open
                for a single destination. Signed in, it takes --br-blue-text as
                a quiet "you are known here" and opens the short menu. */}
            {status === "authed" ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-label={`Account — signed in as ${customer?.email ?? ""}`}
                  aria-expanded={accountOpen}
                  className="inline-flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-white)]"
                  style={{ color: "var(--br-blue-text)" }}
                >
                  <User size={19} strokeWidth={1.5} />
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 top-full w-[230px] border p-4"
                    style={{ background: "var(--br-ink)", borderColor: "var(--br-line)" }}
                  >
                    <p className="br-label truncate" style={{ color: "var(--br-white)" }}>
                      {customerName(customer)}
                    </p>
                    <p className="mt-1.5 truncate text-[12px]" style={{ color: "var(--br-mute)" }}>
                      {customer?.email}
                    </p>
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="br-label mt-4 inline-block transition-colors duration-200 hover:text-[var(--br-white)]"
                      style={{ color: "var(--br-blue-text)" }}
                    >
                      Your account →
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        void logout();
                      }}
                      className="br-label mt-3 block transition-colors duration-200 hover:text-[var(--br-white)]"
                      style={{ color: "var(--br-mute)" }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/account/login"
                aria-label="Sign in"
                className="inline-flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue-text)]"
                style={{ color: "var(--br-white)" }}
              >
                <User size={19} strokeWidth={1.5} />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-blue-text)]"
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

      {mobileMenu}
    </header>
  );
}
