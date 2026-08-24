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
 * Orders, addresses, profile and wishlist arrive in BR-9b. They are shown as
 * pending rather than linked, because a tile that navigates to a 404 is worse
 * than one that says what it is waiting for.
 */
const TILES: Array<{
  label: string;
  blurb: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { label: "Orders", blurb: "What you've ordered and where it is.", Icon: Package },
  { label: "Addresses", blurb: "Where your pieces get delivered.", Icon: MapPin },
  { label: "Profile", blurb: "Your details and password.", Icon: User },
  { label: "Wishlist", blurb: "The pieces you're keeping an eye on.", Icon: Heart },
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
        {TILES.map(({ label, blurb, Icon }) => (
          <div
            key={label}
            className="quiet-frame border p-7"
            style={{ borderRadius: "var(--radius)" }}
          >
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
            <p className="br-label mt-6 text-[10px]" style={{ color: "var(--br-mute)" }}>
              Coming in the next drop
            </p>
          </div>
        ))}
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
