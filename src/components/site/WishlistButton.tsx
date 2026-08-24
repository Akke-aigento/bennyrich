/**
 * The heart.
 *
 * Rendered as a SIBLING of the card's <Link>, never inside it: a <button>
 * within an <a> is invalid HTML and traps keyboard and screen-reader users, and
 * relying on preventDefault to untangle the two is a workaround for a structure
 * that should not exist.
 *
 * Signed out, it does not pretend — it sends the shopper to sign in and brings
 * them back to where they were.
 */
import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  className,
  size = 18,
}: {
  productId: string;
  productName?: string;
  className?: string;
  size?: number;
}) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { has, toggle, isPending } = useWishlist();
  const [busy, setBusy] = useState(false);

  const saved = has(productId);
  const label = saved
    ? `Remove ${productName ?? "this piece"} from your wishlist`
    : `Save ${productName ?? "this piece"} to your wishlist`;

  async function onClick() {
    if (status !== "authed") {
      navigate({ to: "/account/login", search: { next: pathname } });
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || isPending}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-100",
        saved ? "opacity-100" : "opacity-70",
        className,
      )}
      style={{ color: saved ? "var(--br-pink)" : "var(--br-white)" }}
    >
      <Heart size={size} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
