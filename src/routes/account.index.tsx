import { createFileRoute, Link } from "@tanstack/react-router";
import { createElement, type ComponentType } from "react";
import { Heart, MapPin, Package, User } from "lucide-react";
import { RequireAuth } from "@/components/site/RequireAuth";
import { customerName, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [{ title: "Your account — BennyRich" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AccountPage,
});

/**
 * Orders and Profile are deliberately NOT links.
 *
 * Order history cannot be shipped safely yet: get_orders matches by
 * customer_email and get_profile does not return email_verified, so there is
 * nothing to gate on and an unguarded page would expose other people's guest
 * orders. Profile editing simply has not been built. Both stay visible with an
 * honest note rather than pointing at a page that does not exist or cannot
 * load safely — see docs/role-audit.md.
 */
type Tile = {
  label: string;
  blurb: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  to?: "/account/addresses" | "/account/wishlist";
  pending?: string;
};

const TILES: Tile[] = [
  {
    label: "Addresses",
    blurb: "Where your pieces get delivered.",
    Icon: MapPin,
    to: "/account/addresses",
  },
  {
    label: "Wishlist",
    blurb: "The pieces you're keeping an eye on.",
    Icon: Heart,
    to: "/account/wishlist",
  },
  {
    label: "Orders",
    blurb: "What you've ordered and where it is.",
    Icon: Package,
    pending: "Not available yet",
  },
  {
    label: "Profile",
    blurb: "Your details and password.",
    Icon: User,
    pending: "Not available yet",
  },
];

function AccountPage() {
  return (
    <RequireAuth>
      <AccountDashboard />
    </RequireAuth>
  );
}

function AccountDashboard() {
  const { customer, logout } = useAuth();

  return (
    <div className="br-shell br-section">
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        Account
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        {customerName(customer) ? `Welcome, ${customerName(customer)}.` : "Welcome."}
      </h1>
      <p className="mt-5 text-[14px]" style={{ color: "var(--br-mute)" }}>
        {customer?.email}
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {TILES.map(({ label, blurb, Icon, to, pending }) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="br-label" style={{ color: "var(--br-white)" }}>
                    {label}
                  </h2>
                  <p className="mt-2.5 text-[13px]" style={{ color: "var(--br-mute)" }}>
                    {blurb}
                  </p>
                </div>
                <span aria-hidden style={{ color: "var(--br-mute)" }}>
                  {createElement(Icon, { size: 18, strokeWidth: 1.5 })}
                </span>
              </div>
              <p
                className="br-label mt-6 text-[10px]"
                style={{ color: pending ? "var(--br-mute)" : "var(--br-blue-text)" }}
              >
                {pending ?? "Open →"}
              </p>
            </>
          );

          return to ? (
            <Link
              key={label}
              to={to}
              className="quiet-frame hover:neon-line-blue border p-7 transition-[border-color,box-shadow] duration-200"
              style={{ borderRadius: "var(--radius)" }}
            >
              {body}
            </Link>
          ) : (
            <div
              key={label}
              className="quiet-frame border p-7"
              style={{ borderRadius: "var(--radius)", opacity: 0.6 }}
            >
              {body}
            </div>
          );
        })}
      </div>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link to="/shop" className="neon-btn">
          Continue shopping <span aria-hidden>→</span>
        </Link>
        <button type="button" onClick={() => void logout()} className="neon-btn neon-btn-quiet">
          Sign out
        </button>
      </div>
    </div>
  );
}
